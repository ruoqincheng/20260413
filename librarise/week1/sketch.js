let grasses = [];
let bubbles = [];
let particles = [];
let colors = ['#dad7cd', '#a3b18a', '#588157', '#3a5a40', '#344e41'];
let iframe;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('pointer-events', 'none'); // 讓滑鼠事件穿透 canvas，以便操作下方網頁
  canvas.style('z-index', '1'); // 確保畫布在最上層
  
  iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw/');
  iframe.position(0, 0);
  iframe.size(windowWidth, windowHeight);
  iframe.style('border', 'none');
  iframe.style('z-index', '-1'); // 確保網頁在最底層
  
  // 初始化 50 根草的數據
  for (let i = 0; i < 50; i++) {
    grasses.push({
      color: random(colors),
      noiseOffset: random(1000) // 讓每根草的搖擺相位不同
    });
  }
}

function draw() {
  background(189, 224, 254, 51); // 背景顏色透明度 0.2 (255 * 0.2 ≈ 51)

  noStroke();
  blendMode(BLEND); // 使用混合模式產生色彩重疊效果

  let plantHeight = height / 3;
  let segments = 60;

  for (let k = 0; k < grasses.length; k++) {
    let c = color(grasses[k].color);
    c.setAlpha(150); // 設定透明度
    fill(c);
    let baseX = (k + 0.5) * (width / grasses.length); // 均衡分佈在視窗寬度內
    
    beginShape();
    for (let i = 0; i <= segments; i++) {
      drawPlantVertex(i, segments, baseX, plantHeight, -1, grasses[k].noiseOffset);
    }
    for (let i = segments; i >= 0; i--) {
      drawPlantVertex(i, segments, baseX, plantHeight, 1, grasses[k].noiseOffset);
    }
    endShape(CLOSE);
  }

  // 產生與管理水泡
  if (random(1) < 0.1) { // 控制水泡產生頻率
    bubbles.push(new Bubble());
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isPopped()) {
      createExplosion(bubbles[i].x, bubbles[i].y);
      bubbles.splice(i, 1);
    }
  }

  // 管理爆破效果
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }
}

function drawPlantVertex(i, segments, baseX, plantHeight, sideMultiplier, noiseOffset) {
  let t = i / segments; // 0.0 to 1.0 representing progress from bottom to top
  let y = height - (t * plantHeight);
  let n = noise(i * 0.1, frameCount * 0.02 + noiseOffset);
  let xOffset = map(n, 0, 1, -80, 80) * t; // Sway increases towards the top (t * factor)
  let thickness = map(t, 0, 1, 15, 0);     // Thickness tapers to 0 at the top
  curveVertex(baseX + xOffset + (thickness * sideMultiplier), y);
}

function createExplosion(x, y) {
  for (let i = 0; i < 8; i++) {
    particles.push(new Particle(x, y));
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 20;
    this.size = random(15, 30);
    this.speed = random(1, 3);
    this.popY = random(height * 0.2, height * 0.7); // 設定隨機破裂的高度限制
  }

  update() {
    this.y -= this.speed;
    this.x += sin(frameCount * 0.05 + this.x) * 0.5; // 左右輕微搖擺
  }

  display() {
    noStroke();
    fill(255, 127); // 水泡本體：白色，透明度 0.5
    ellipse(this.x, this.y, this.size);
    fill(255, 178); // 反光效果：白色圓圈，透明度 0.7
    ellipse(this.x + this.size * 0.2, this.y - this.size * 0.2, this.size * 0.3);
  }

  isPopped() {
    return this.y < this.popY;
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.alpha = 255;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 10; // 逐漸消失
  }

  display() {
    noStroke();
    fill(255, this.alpha);
    ellipse(this.x, this.y, 3);
  }

  finished() {
    return this.alpha < 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (iframe) {
    iframe.size(windowWidth, windowHeight);
  }
}
