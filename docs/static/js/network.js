const canvas = document.getElementById("network-bg");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ================= CONFIG =================
const NUM_NODES = 160;
const MAX_DIST = 190;
const GROWTH_SPEED = 0.01;

// ================= NODES =================
const nodes = [];

for (let i = 0; i < NUM_NODES; i++) {
  nodes.push({
    x: canvas.width / 2,
    y: canvas.height / 2,

    targetX: Math.random() * canvas.width,
	targetY: Math.random() * canvas.height,

    progress: 0,
    size: Math.random() < 0.15 ? 4 : 2.5 : 1.5 
  });
}

// ================= SCROLL ROTATION =================
let scroll = 0;

window.addEventListener("scroll", () => {
  scroll = window.scrollY;
});

// ================= UPDATE =================
function update() {
  nodes.forEach(node => {

    // smooth build (kein "Schnipsel-Effekt")
    if (node.progress < 1) {
      node.progress += (1 - node.progress) * GROWTH_SPEED;

      node.x =
        canvas.width / 2 +
        (node.targetX - canvas.width / 2) * node.progress;

      node.y =
        canvas.height / 2 +
        (node.targetY - canvas.height / 2) * node.progress;
    }

    // leichte organische Bewegung
    else {
      node.x += Math.sin(Date.now() * 0.001 + node.seed) * 0.1;
      node.y += Math.cos(Date.now() * 0.001 + node.seed) * 0.1;
    }
  });
}

// ================= DRAW LINES =================
function drawLines() {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {

      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DIST) {
        const opacity = 1 - dist / MAX_DIST;

        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);

        ctx.strokeStyle = `rgba(0,155,185,${opacity * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}

// ================= DRAW NODES =================
function drawNodes() {
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size ?? 2, 0, Math.PI * 2);
    ctx.fillStyle = "#009bb9";
    ctx.fill();
  });
}

// ================= DRAW =================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  const tilt = scroll * 0.0003;

// horizontale "3D"-Verzerrung
  ctx.transform(
  	1, 0,
  	Math.sin(tilt) * 0.5, 1,
  	0, 0
		);	
  drawLines();
  drawNodes();

  ctx.restore();
}

// ================= LOOP =================
function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}

animate();
