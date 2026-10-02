const canvas = document.getElementById("network-bg");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.backgroundColor = 'transparent';
}
resize();
window.addEventListener("resize", resize);

// ================= CONFIG =================
const isMobile = window.innerWidth < 768;

const NUM_NODES = isMobile ? 55 : 160;
const MAX_DIST = isMobile ? 110 : 190;
const GROWTH_SPEED = 0.085;

// ================= NODES =================
const nodes = [];

for (let i = 0; i < NUM_NODES; i++) {
  nodes.push({
    x: canvas.width / 2,
    y: canvas.height / 2,

    targetX: Math.random() * canvas.width,
    targetY: Math.random() * canvas.height,

    progress: 0,
    size: Math.random() < 0.1 ? 3.5 : 1.5,
    seed: Math.random() * Math.PI * 2
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
    if (node.progress < 0.9999) {
      node.progress += (1 - node.progress) * GROWTH_SPEED;

      node.x =
        canvas.width / 2 +
        (node.targetX - canvas.width / 2) * node.progress;

      node.y =
        canvas.height / 2 +
        (node.targetY - canvas.height / 2) * node.progress;
    } else {
      node.progress = 1;
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
  ctx.transform(1, 0, Math.sin(tilt) * 0.05, 1, 0, 0);
  drawLines();
  drawNodes();
  ctx.restore();
}

// ========================================================================== 
// UI INTERACTIONS
// ========================================================================== 

// ================= SECTION WRAPPERS =================
document.querySelectorAll('.section-wrapper').forEach(wrapper => {
  const header = wrapper.querySelector('.section-header');
  const content = wrapper.querySelector('.section-content');

  if (!header || !content) return;

  header.setAttribute('tabindex', '0');
  header.setAttribute('role', 'button');
  header.setAttribute('aria-expanded', wrapper.classList.contains('expanded') ? 'true' : 'false');

  const toggle = () => {
    wrapper.classList.toggle('expanded');
    header.setAttribute('aria-expanded', wrapper.classList.contains('expanded') ? 'true' : 'false');
  };

  header.addEventListener('click', toggle);
  header.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });
});

// ================= COLLAPSIBLE INFO BOXES =================
document.querySelectorAll('.info-box.collapsible').forEach(box => {
  const header = box.querySelector('.box-header');
  const content = box.querySelector('.box-content');

  if (!header || !content) return;

  header.setAttribute('tabindex', '0');
  header.setAttribute('role', 'button');
  header.setAttribute('aria-expanded', box.classList.contains('expanded') ? 'true' : 'false');

  const toggle = () => {
    box.classList.toggle('expanded');
    header.setAttribute('aria-expanded', box.classList.contains('expanded') ? 'true' : 'false');
  };

  header.addEventListener('click', toggle);
  header.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });
});

// ================= SPEAKER ACCORDIONS =================
document.querySelectorAll('.accordion-button').forEach(button => {
  const content = button.nextElementSibling;
  if (!content || !content.classList.contains('accordion-content')) return;

  button.setAttribute('aria-expanded', button.classList.contains('active') ? 'true' : 'false');

  button.addEventListener('click', () => {
    const isActive = button.classList.contains('active');

    // Preserve the Online-Seminar page behaviour: within a section, only one
    // speaker accordion is open at a time. On Previous Seminars, accordions
    // remain independent, matching the previous implementation.
    const sectionContent = button.closest('.section-content');
    if (sectionContent && !isActive) {
      sectionContent.querySelectorAll('.accordion-button').forEach(otherButton => {
        if (otherButton === button) return;
        const otherContent = otherButton.nextElementSibling;
        otherButton.classList.remove('active');
        otherButton.setAttribute('aria-expanded', 'false');
        if (otherContent) otherContent.style.display = 'none';
      });
    }

    button.classList.toggle('active', !isActive);
    button.setAttribute('aria-expanded', !isActive ? 'true' : 'false');
    content.style.display = !isActive ? 'block' : 'none';
  });
});

// ================= CO-ORGANIZER DISCLOSURES =================
document.querySelectorAll('.organizer-button').forEach(button => {
  const item = button.closest('.organizer-item');
  const content = item?.querySelector('.organizer-content');
  if (!item || !content) return;

  button.setAttribute('aria-expanded', 'false');

  button.addEventListener('click', () => {
    const willOpen = button.getAttribute('aria-expanded') !== 'true';
    const section = button.closest('.organizer-section');

    // Keep this compact: opening one organizer closes the other organizer rows.
    section?.querySelectorAll('.organizer-button').forEach(otherButton => {
      if (otherButton === button) return;
      otherButton.setAttribute('aria-expanded', 'false');
      const otherContent = otherButton.closest('.organizer-item')?.querySelector('.organizer-content');
      if (otherContent) otherContent.style.display = 'none';
    });

    button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    content.style.display = willOpen ? 'block' : 'none';
  });
});

// ================= LOOP =================
function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}

animate();
