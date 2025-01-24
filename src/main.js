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
const firstCardMaterial = new THREE.MeshBasicMaterial({ 
  map: cardTextures[firstCardIndex],
  transparent: true
});
const firstCardMesh = new THREE.Mesh(cardGeometry, firstCardMaterial);
firstCardMesh.position.x = -2; // 左側に配置
scene.add(firstCardMesh);

// 2枚目のカード（表裏の2枚のメッシュを作成）
let secondCardIndex = Math.floor(Math.random() * cardTextures.length);
// 表面のカード
const frontCardMaterial = new THREE.MeshBasicMaterial({ 
  map: cardTextures[secondCardIndex],
  transparent: true
});
const frontCardMesh = new THREE.Mesh(cardGeometry, frontCardMaterial);
frontCardMesh.position.x = 2;
frontCardMesh.rotation.y = Math.PI;
scene.add(frontCardMesh);

// 裏面のカード
const backCardMaterial = new THREE.MeshBasicMaterial({ 
  map: backTexture,
  transparent: true
});
const backCardMesh = new THREE.Mesh(cardGeometry, backCardMaterial);
backCardMesh.position.x = 2;
scene.add(backCardMesh);

// ゲームの状態
let isGameOver = false;

// カメラの位置
camera.position.z = 5;

// UI要素の作成
let score = 0;
const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '10px';
uiContainer.style.left = '10px';
uiContainer.style.fontSize = '20px';
uiContainer.style.color = 'white';
document.body.appendChild(uiContainer);

// スコア表示
const scoreDisplay = document.createElement('div');
scoreDisplay.textContent = `Score: ${score}`;
uiContainer.appendChild(scoreDisplay);

// 結果表示
const resultDisplay = document.createElement('div');
resultDisplay.style.position = 'absolute';
resultDisplay.style.top = '50%';
resultDisplay.style.left = '50%';
resultDisplay.style.transform = 'translate(-50%, -50%)';
resultDisplay.style.fontSize = '48px';
resultDisplay.style.fontWeight = 'bold';
resultDisplay.style.color = 'white';
resultDisplay.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
resultDisplay.style.opacity = '0';
resultDisplay.style.transition = 'opacity 0.3s ease-in-out';
resultDisplay.style.textAlign = 'center';
resultDisplay.style.whiteSpace = 'pre-line';
document.body.appendChild(resultDisplay);

// カードをめくるアニメーション
function flipSecondCard() {
  const flipDuration = 500; // ミリ秒
  let startTime = null;

  function flip(currentTime) {
    if (startTime === null) {
      startTime = currentTime;
    }

    const elapsedTime = currentTime - startTime;
    if (elapsedTime >= flipDuration) {
      // アニメーション完了時の処理
      frontCardMesh.rotation.y = 0;
      backCardMesh.rotation.y = Math.PI;
      return;
    }

    requestAnimationFrame(flip);
    const progress = elapsedTime / flipDuration;
    // イーズアウト関数を使用してスムーズな回転を実現
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const rotation = easeProgress * Math.PI;
    
    // 表と裏のカードを同時に回転（完全な180度回転）
    frontCardMesh.rotation.y = Math.PI + (Math.PI * easeProgress);
    backCardMesh.rotation.y = Math.PI * easeProgress;
  }

  requestAnimationFrame(flip);
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
      // 正解表示
      resultDisplay.textContent = 'CORRECT!';
      resultDisplay.style.color = '#44ff44';
      resultDisplay.style.opacity = '1';
      setTimeout(() => {
        resultDisplay.style.opacity = '0';
        setTimeout(() => {
          startNewRound();
        }, 300);
      }, 1000);
    } else {
      // ゲームオーバー表示
      resultDisplay.textContent = `GAME OVER!\nFinal Score: ${score}`;
      resultDisplay.style.color = '#ff4444';
      resultDisplay.style.opacity = '1';
      score = 0;
      scoreDisplay.textContent = `Score: ${score}`;
      isGameOver = true;
      // 3秒後に結果表示を消す
      setTimeout(() => {
        resultDisplay.style.opacity = '0';
      }, 3000);
    }
  }, 500);
}

// 新しいラウンドを開始
function startNewRound() {
  // 結果表示をクリア
  resultDisplay.style.opacity = '0';
  
  // 新しいカードをセット
  firstCardIndex = Math.floor(Math.random() * cardTextures.length);
  secondCardIndex = Math.floor(Math.random() * cardTextures.length);
  
  // 1枚目のカードを更新
  firstCardMesh.material.map = cardTextures[firstCardIndex];
  
  // 2枚目のカードを更新
  frontCardMaterial.map = cardTextures[secondCardIndex];
  frontCardMaterial.needsUpdate = true;
  
  // 回転をリセット
  firstCardMesh.rotation.y = 0;
  frontCardMesh.rotation.y = Math.PI;
  backCardMesh.rotation.y = 0;
}

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// 矢印のテクスチャを読み込む
const arrowTexture = loader.load('./public/ui/93.png');

// 矢印のジオメトリを作成
const arrowGeometry = new THREE.PlaneGeometry(1, 1);

// 上向き矢印のメッシュを作成
const upArrowMaterial = new THREE.MeshBasicMaterial({ 
  map: arrowTexture,
  transparent: true,
  color: 0x44ff44
});
const upArrowMesh = new THREE.Mesh(arrowGeometry, upArrowMaterial);
upArrowMesh.position.set(0, 0.8, 0);
upArrowMesh.rotation.z = -Math.PI / 2; // -90度回転して上向きに
scene.add(upArrowMesh);

// 下向き矢印のメッシュを作成
const downArrowMaterial = new THREE.MeshBasicMaterial({ 
  map: arrowTexture,
  transparent: true,
  color: 0xff4444
});
const downArrowMesh = new THREE.Mesh(arrowGeometry, downArrowMaterial);
downArrowMesh.position.set(0, -0.8, 0);
downArrowMesh.rotation.z = Math.PI / 2; // 90度回転して下向きに
scene.add(downArrowMesh);

// クリックイベントの処理
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// クリックイベントリスナー
window.addEventListener('click', (event) => {
  // マウス位置を正規化
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // レイキャスターを更新
  raycaster.setFromCamera(mouse, camera);

  // 交差判定
  const intersects = raycaster.intersectObjects([upArrowMesh, downArrowMesh]);
  
  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    if (clickedMesh === upArrowMesh) {
      checkGuess(true);  // High
    } else if (clickedMesh === downArrowMesh) {
      checkGuess(false); // Low
    }
  }
});

// ホバー効果
let hoveredArrow = null;
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([upArrowMesh, downArrowMesh]);

  if (intersects.length > 0) {
    const arrow = intersects[0].object;
    if (hoveredArrow !== arrow) {
      if (hoveredArrow) {
        // 前にホバーしていた矢印の色を戻す
        hoveredArrow.material.color.setHex(
          hoveredArrow === upArrowMesh ? 0x44ff44 : 0xff4444
        );
      }
      // 新しくホバーした矢印の色を変更
      arrow.material.color.setHex(0xffff00);
      hoveredArrow = arrow;
      document.body.style.cursor = 'pointer';
    }
  } else if (hoveredArrow) {
    // ホバーが外れたら色を戻す
    hoveredArrow.material.color.setHex(
      hoveredArrow === upArrowMesh ? 0x44ff44 : 0xff4444
    );
    hoveredArrow = null;
    document.body.style.cursor = 'default';
  }
});
