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

// カードを表示するためのジオメトリと素材
const cardGeometry = new THREE.PlaneGeometry(2, 3);
let currentCardIndex = Math.floor(Math.random() * cardTextures.length); // 現在のカード
const cardMaterial = new THREE.MeshBasicMaterial({ map: cardTextures[currentCardIndex] });
const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(cardMesh);

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
function flipCard(nextCardIndex) {
  const flipDuration = 500; // ミリ秒
  let elapsedTime = 0;

  function flip() {
    if (elapsedTime < flipDuration) {
      requestAnimationFrame(flip);
      elapsedTime += 16; // 16ms は約 60FPS
      const rotation = (elapsedTime / flipDuration) * Math.PI; // 回転量を計算
      cardMesh.rotation.y = rotation; // Y軸回転
      if (rotation > Math.PI / 2 && cardMesh.material.map !== cardTextures[nextCardIndex]) {
        cardMesh.material.map = cardTextures[nextCardIndex]; // 回転の途中でカードを更新
      }
    } else {
      cardMesh.rotation.y = 0; // 回転をリセット
    }
  }

  flip();
}

// ゲームロジック
function nextCard(isHigher) {
  const nextCardIndex = Math.floor(Math.random() * cardTextures.length); // ランダムに次のカードを選ぶ
  const currentCardValue = (currentCardIndex % 13) + 1; // 現在のカードの値（1～13）
  const nextCardValue = (nextCardIndex % 13) + 1; // 次のカードの値（1～13）

  // 判定
  const isCorrect = isHigher
    ? nextCardValue > currentCardValue
    : nextCardValue < currentCardValue;

  if (isCorrect) {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
  } else {
    alert(`Wrong! Game Over. Your final score is ${score}`);
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
  }

  // カードをめくるアニメーションを開始
  flipCard(nextCardIndex);

  // 現在のカードを更新
  currentCardIndex = nextCardIndex;
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
highButton.onclick = () => nextCard(true);
document.body.appendChild(highButton);

const lowButton = document.createElement('button');
lowButton.textContent = 'Low';
lowButton.style.position = 'absolute';
lowButton.style.top = '50px';
lowButton.style.left = '80px';
lowButton.style.fontSize = '16px';
lowButton.onclick = () => nextCard(false);
document.body.appendChild(lowButton);
