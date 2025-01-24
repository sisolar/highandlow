// CDN から Three.js をインポート
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

// シーン、カメラ、レンダラーを初期化
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// トランプカードのテクスチャを読み込む
const loader = new THREE.TextureLoader();
const cardTextures = [];
const cardPaths = [
  'Heart01', 'Heart02', 'Heart03', 'Heart04', 'Heart05', 'Heart06', 'Heart07', 'Heart08', 'Heart09', 'Heart10', 'Heart11', 'Heart12', 'Heart13',
  'Spade01', 'Spade02', 'Spade03', 'Spade04', 'Spade05', 'Spade06', 'Spade07', 'Spade08', 'Spade09', 'Spade10', 'Spade11', 'Spade12', 'Spade13',
  'Club01', 'Club02', 'Club03', 'Club04', 'Club05', 'Club06', 'Club07', 'Club08', 'Club09', 'Club10', 'Club11', 'Club12', 'Club13',
  'Diamond01', 'Diamond02', 'Diamond03', 'Diamond04', 'Diamond05', 'Diamond06', 'Diamond07', 'Diamond08', 'Diamond09', 'Diamond10', 'Diamond11', 'Diamond12', 'Diamond13',
  'Joker_Color', 'Joker_Monochrome'
];

// カード画像をロード
cardPaths.forEach(path => {
  cardTextures.push(loader.load(`./public/cards/${path}.png`));
});

// カードの裏面のテクスチャを読み込む
const backTexture = loader.load('./public/cards/BackColor_Blue.png');

// カードを表示するためのジオメトリと素材
const cardGeometry = new THREE.PlaneGeometry(2, 3);

// 1枚目のカード（表示される）
let firstCardIndex = Math.floor(Math.random() * cardTextures.length);
const firstCardMaterial = new THREE.MeshBasicMaterial({ map: cardTextures[firstCardIndex] });
const firstCardMesh = new THREE.Mesh(cardGeometry, firstCardMaterial);
firstCardMesh.position.x = -2; // 左側に配置
scene.add(firstCardMesh);

// 2枚目のカード（最初は裏面）
let secondCardIndex = Math.floor(Math.random() * cardTextures.length);
const secondCardMaterial = new THREE.MeshBasicMaterial({ map: backTexture });
const secondCardMesh = new THREE.Mesh(cardGeometry, secondCardMaterial);
secondCardMesh.position.x = 2; // 右側に配置
scene.add(secondCardMesh);

// ゲームの状態
let isGameOver = false;

// カメラの位置
camera.position.z = 5;

// スコアの表示要素を作成
let score = 0;
const scoreDisplay = document.createElement('div');
scoreDisplay.style.position = 'absolute';
scoreDisplay.style.top = '10px';
scoreDisplay.style.left = '10px';
scoreDisplay.style.fontSize = '20px';
scoreDisplay.style.color = 'white';
scoreDisplay.textContent = `Score: ${score}`;
document.body.appendChild(scoreDisplay);

// カードをめくるアニメーション
function flipSecondCard() {
  const flipDuration = 500; // ミリ秒
  let elapsedTime = 0;

  function flip() {
    if (elapsedTime < flipDuration) {
      requestAnimationFrame(flip);
      elapsedTime += 16; // 16ms は約 60FPS
      const rotation = (elapsedTime / flipDuration) * Math.PI; // 回転量を計算
      secondCardMesh.rotation.y = rotation; // Y軸回転
      if (rotation > Math.PI / 2 && secondCardMesh.material.map === backTexture) {
        secondCardMesh.material.map = cardTextures[secondCardIndex]; // 回転の途中でカードを更新
      }
    } else {
      secondCardMesh.rotation.y = 0; // 回転をリセット
    }
  }

  flip();
}

// ゲームロジック
function checkGuess(isHigher) {
  if (isGameOver) {
    // 新しいゲームを開始
    isGameOver = false;
    startNewRound();
    return;
  }

  const firstCardValue = (firstCardIndex % 13) + 1; // 1枚目のカードの値（1～13）
  const secondCardValue = (secondCardIndex % 13) + 1; // 2枚目のカードの値（1～13）

  // カードをめくるアニメーションを開始
  flipSecondCard();

  // 判定
  const isCorrect = isHigher
    ? secondCardValue > firstCardValue
    : secondCardValue < firstCardValue;

  setTimeout(() => {
    if (isCorrect) {
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
      setTimeout(() => {
        startNewRound();
      }, 1000);
    } else {
      alert(`Wrong! Game Over. Your final score is ${score}`);
      score = 0;
      scoreDisplay.textContent = `Score: ${score}`;
      isGameOver = true;
    }
  }, 500);
}

// 新しいラウンドを開始
function startNewRound() {
  // 新しいカードをセット
  firstCardIndex = Math.floor(Math.random() * cardTextures.length);
  secondCardIndex = Math.floor(Math.random() * cardTextures.length);
  
  // 1枚目のカードを更新
  firstCardMesh.material.map = cardTextures[firstCardIndex];
  
  // 2枚目のカードを裏面に戻す
  secondCardMesh.material.map = backTexture;
  
  // 回転をリセット
  firstCardMesh.rotation.y = 0;
  secondCardMesh.rotation.y = 0;
}

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// ボタンで High / Low を選択
const highButton = document.createElement('button');
highButton.textContent = 'High';
highButton.style.position = 'absolute';
highButton.style.top = '50px';
highButton.style.left = '10px';
highButton.style.fontSize = '16px';
highButton.onclick = () => checkGuess(true);
document.body.appendChild(highButton);

const lowButton = document.createElement('button');
lowButton.textContent = 'Low';
lowButton.style.position = 'absolute';
lowButton.style.top = '50px';
lowButton.style.left = '80px';
lowButton.style.fontSize = '16px';
lowButton.onclick = () => checkGuess(false);
document.body.appendChild(lowButton);
