let seaweeds = [];
let fishes = [];
let bubbles = [];
let currentWeek = 0; // 追蹤目前選擇的週數，影響海草生長

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight * 0.4);
  canvas.parent('sketch-container'); // 確保畫布放在 HTML 的容器內

  // 初始化海草
  for (let i = 0; i < 15; i++) {
    seaweeds.push(new Seaweed(random(width), random(50, 100)));
  }

  // 初始化魚群
  for (let i = 0; i < 5; i++) {
    fishes.push(new Fish());
  }

  // 初始化代表週數的作品氣泡
  // 這裡可以根據實際週數增加資料
  let weekData = [
    { label: "第一週", url: "./week1/index.html" },
    { label: "第二週", url: "./week1/index.html" }
  ];

  for (let i = 0; i < weekData.length; i++) {
    // 將氣泡均勻分佈在畫面上
    let x = map(i, -1, weekData.length, 0, width);
    bubbles.push(new Bubble(x, height / 2, weekData[i]));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight * 0.4);
}

function draw() {
  // 水底漸層背景
  drawUnderwaterBackground();

  // 更新與顯示海草 (象徵學習成長，高度與選擇的週數有關)
  for (let s of seaweeds) {
    s.update(currentWeek);
    s.display();
  }

  // 更新與顯示魚群
  for (let f of fishes) {
    f.move();
    f.display();
  }

  // 顯示互動氣泡
  for (let b of bubbles) {
    b.display();
  }
}

function mousePressed() {
  for (let i = 0; i < bubbles.length; i++) {
    if (bubbles[i].checkClick(mouseX, mouseY)) {
      currentWeek = i + 1; // 增加週數，讓海草長高
      updateIframe(bubbles[i].data.url);
    }
  }
}

function drawUnderwaterBackground() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(0, 100, 200), color(0, 20, 50), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function updateIframe(url) {
  let iframe = select('#myIframe'); // 取得 HTML 中的 iframe
  if (iframe) {
    iframe.attribute('src', url);
  }
}

// 海草類別
class Seaweed {
  constructor(x, baseHeight) {
    this.x = x;
    this.baseHeight = baseHeight;
    this.currentHeight = baseHeight;
    this.noiseOffset = random(1000);
  }

  update(week) {
    // 創意視覺隱喻：隨週數增加，目標高度變高
    let targetH = this.baseHeight + (week * 40);
    this.currentHeight = lerp(this.currentHeight, targetH, 0.05);
  }

  display() {
    stroke(50, 200, 100, 150);
    strokeWeight(6);
    noFill();
    beginShape();
    for (let i = 0; i < 10; i++) {
      let y = map(i, 0, 10, height, height - this.currentHeight);
      let sway = map(noise(this.noiseOffset, frameCount * 0.01 + i * 0.1), 0, 1, -20, 20);
      vertex(this.x + sway, y);
    }
    endShape();
  }
}

// 魚類別 (使用 Vertex 勾勒)
class Fish {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.speed = random(1, 3);
    this.size = random(0.5, 1.2);
    this.color = color(random(200, 255), random(150, 200), 50);
  }

  move() {
    this.pos.x += this.speed;
    if (this.pos.x > width + 50) this.pos.x = -50;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    scale(this.size);
    fill(this.color);
    noStroke();
    // 使用 vertex 繪製魚
    beginShape();
    vertex(20, 0);   // 魚頭
    bezierVertex(10, -15, -10, -15, -20, 0); // 上身
    vertex(-30, -10); // 魚尾上
    vertex(-25, 0);   // 魚尾中
    vertex(-30, 10);  // 魚尾下
    vertex(-20, 0);   // 魚尾接回
    bezierVertex(-10, 15, 10, 15, 20, 0); // 下身
    endShape(CLOSE);
    pop();
  }
}

// 氣泡按鈕類別
class Bubble {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.r = 40;
    this.data = data;
    this.floatOffset = random(1000);
  }

  display() {
    let yOffset = map(noise(this.floatOffset, frameCount * 0.01), 0, 1, -10, 10);
    push();
    translate(this.x, this.y + yOffset);
    fill(255, 255, 255, 100);
    stroke(255, 255, 255, 200);
    circle(0, 0, this.r * 2);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text(this.data.label, 0, 0);
    pop();
  }

  checkClick(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.r;
  }
}
