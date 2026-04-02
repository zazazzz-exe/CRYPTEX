console.log("Sci-fi animation started");

if (window.gsap) {
  gsap.from(".panel", {
    y: -30,
    opacity: 0,
    duration: 1.5
  });

  gsap.from(".hud", {
    opacity: 0,
    y: 20,
    stagger: 0.12,
    duration: 1.05,
    ease: "power2.out"
  });
}

const fpsEl = document.getElementById("metric-fps");
const energyEl = document.getElementById("metric-energy");
const fluxEl = document.getElementById("metric-flux");
const particlesEl = document.getElementById("metric-particles");
const statusEl = document.getElementById("metric-status");
const logEl = document.getElementById("system-log");
const powerEl = document.getElementById("power-level");

const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

const letters = "01";
const fontSize = 14;
let columns = 0;

const drops = [];

function resizeCanvas() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = window.devicePixelRatio || 1;

  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  columns = Math.floor(width / fontSize);
  drops.length = columns;

  for (let i = 0; i < columns; i++) {
    if (typeof drops[i] !== "number") {
      drops[i] = 1;
    }
  }
}

function draw() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.fillStyle = "#00ff00";
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function animate() {
  draw();
  requestAnimationFrame(animate);
}

animate();

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x001108, 5, 18);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("three-container").appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0x2cff88, 0.3);
scene.add(ambient);

const rimLight = new THREE.PointLight(0x44ff99, 1.15, 30, 2);
rimLight.position.set(0, 2, 4);
scene.add(rimLight);

const towerGroup = new THREE.Group();
scene.add(towerGroup);

const core = new THREE.Mesh(
  new THREE.CylinderGeometry(0.42, 0.28, 2.6, 22, 1, true),
  new THREE.MeshPhongMaterial({
    color: 0x1eff7a,
    emissive: 0x0a582c,
    emissiveIntensity: 0.75,
    transparent: true,
    opacity: 0.38,
    shininess: 90,
    side: THREE.DoubleSide
  })
);
towerGroup.add(core);

const shell = new THREE.Mesh(
  new THREE.CylinderGeometry(0.62, 0.5, 3.1, 8, 1, true),
  new THREE.MeshBasicMaterial({
    color: 0x00ff77,
    wireframe: true,
    transparent: true,
    opacity: 0.72
  })
);
towerGroup.add(shell);

for (let i = 0; i < 4; i++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.92 + i * 0.09, 0.012, 10, 70),
    new THREE.MeshBasicMaterial({
      color: 0x5dffaf,
      transparent: true,
      opacity: 0.58
    })
  );

  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.95 + i * 0.68;
  towerGroup.add(ring);
}

const topSpire = new THREE.Mesh(
  new THREE.ConeGeometry(0.2, 0.56, 16),
  new THREE.MeshBasicMaterial({ color: 0x77ffc2, wireframe: true })
);
topSpire.position.y = 1.65;
towerGroup.add(topSpire);

const floorGroup = new THREE.Group();
scene.add(floorGroup);

const gridFloor = new THREE.GridHelper(16, 36, 0x00ff6f, 0x0f5128);
gridFloor.position.y = -1.45;
floorGroup.add(gridFloor);

const floorDisk = new THREE.Mesh(
  new THREE.CircleGeometry(5.3, 50),
  new THREE.MeshBasicMaterial({
    color: 0x0f3f23,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide
  })
);
floorDisk.rotation.x = -Math.PI / 2;
floorDisk.position.y = -1.44;
floorGroup.add(floorDisk);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(0.85, 0.85, 0.85),
  new THREE.MeshBasicMaterial({
    color: 0x00ff99,
    wireframe: true
  })
);
cube.position.y = -0.15;
towerGroup.add(cube);

const particleCount = 1100;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  const r = 2 + Math.random() * 4;
  const theta = Math.random() * Math.PI * 2;
  const y = -1.2 + Math.random() * 4.8;

  particlePositions[i * 3] = Math.cos(theta) * r;
  particlePositions[i * 3 + 1] = y;
  particlePositions[i * 3 + 2] = Math.sin(theta) * r;
}

particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

const particles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    color: 0x7fffc8,
    size: 0.035,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(particles);

camera.position.set(0, 1.2, 5.6);

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener("pointerdown", (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener("pointerup", () => {
  isDragging = false;
});

window.addEventListener("pointermove", (e) => {
  if (!isDragging) {
    return;
  }

  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;

  towerGroup.rotation.y += deltaX * 0.008;
  towerGroup.rotation.x += deltaY * 0.002;
  towerGroup.rotation.x = Math.max(-0.35, Math.min(0.35, towerGroup.rotation.x));

  previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
});

const logMessages = [
  "Calibrating hologram lattice...",
  "Quantum floor grid synchronized.",
  "Particle relay stable.",
  "Neural telemetry uplink secured.",
  "Spectral tower heartbeat nominal."
];

let logIndex = 0;
let lastTime = performance.now();

function animate3D(time) {
  requestAnimationFrame(animate3D);

  const delta = time - lastTime;
  lastTime = time;
  const fps = delta > 0 ? Math.round(1000 / delta) : 60;
  const t = time * 0.001;

  towerGroup.rotation.y += 0.006;
  cube.rotation.x += 0.008;
  cube.rotation.y += 0.012;
  floorGroup.rotation.y -= 0.0015;

  particles.rotation.y += 0.0008;
  const positions = particleGeometry.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    const yIndex = i * 3 + 1;
    positions[yIndex] += Math.sin(t + i * 0.03) * 0.0008;
  }

  particleGeometry.attributes.position.needsUpdate = true;

  const energy = Math.round((Math.sin(t * 1.25) * 0.5 + 0.5) * 100);
  const flux = (towerGroup.rotation.y % (Math.PI * 2)).toFixed(2);

  fpsEl.textContent = String(fps);
  energyEl.textContent = `${energy}%`;
  fluxEl.textContent = flux;
  particlesEl.textContent = String(particleCount);
  statusEl.textContent = energy > 30 ? "SYNCED" : "LOW POWER";
  powerEl.style.width = `${energy}%`;

  if (time % 2600 < 18) {
    logEl.textContent = logMessages[logIndex % logMessages.length];
    logIndex++;
  }

  renderer.render(scene, camera);
}

animate3D();