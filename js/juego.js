'use strict';
/**
 * CAZA DE ESPÍRITUS 2D — Motor Canvas 2D
 * Eduardo Zenil Guerrero · Graficación
 *
 * Reglas de negocio cubiertas:
 *  - 25 entidades en 4 patrones de movimiento (arriba, abajo, diagonal, circular)
 *  - Aparición/desaparición con duración de vida aleatoria y reaparición en otra zona
 *  - Rebote físico en colisiones + animación de choque (onda, chispas, "squash")
 *  - Captura por clic: la entidad se desvanece y reaparece en otro punto; siempre hay 25
 *  - Imagen de fondo, música de fondo real y favicon, todo en /assets
 *  - Puntero personalizado cargado desde /assets (normal y al pasar sobre un objetivo)
 *  - Contador de objetos capturados + puntos, combo, precisión y récord (localStorage)
 */

let gameState = 'MENU'; // MENU | PLAYING | PAUSED

// ================== MOTOR DE AUDIO ==================
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.musica = document.getElementById('musicaFondo');
    this.musica.volume = 0.35;
  }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  playMusic() { this.musica.play().catch(() => {}); }
  stopMusic() { this.musica.pause(); }

  // Sonido único por tipo de entidad al capturarla
  playCaptureSound(tipo, combo = 1) {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain(), now = this.ctx.currentTime;
    switch (tipo) {
      case 'calavera':
        osc.type = 'triangle'; osc.frequency.setValueAtTime(220 * combo, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + .3);
        gain.gain.setValueAtTime(.3, now); gain.gain.exponentialRampToValueAtTime(.001, now + .35); break;
      case 'calabaza':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150 * combo, now);
        osc.frequency.linearRampToValueAtTime(75, now + .18);
        gain.gain.setValueAtTime(.35, now); gain.gain.exponentialRampToValueAtTime(.001, now + .22); break;
      case 'fantasma':
        osc.type = 'sine'; osc.frequency.setValueAtTime(587.33 * combo, now);
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + .28);
        gain.gain.setValueAtTime(.2, now); gain.gain.exponentialRampToValueAtTime(.001, now + .32); break;
      case 'murcielago':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(880 * combo, now);
        osc.frequency.linearRampToValueAtTime(1400, now + .12);
        gain.gain.setValueAtTime(.15, now); gain.gain.exponentialRampToValueAtTime(.001, now + .15); break;
      case 'vela':
        osc.type = 'sine'; osc.frequency.setValueAtTime(783.99 * combo, now);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + .22);
        gain.gain.setValueAtTime(.25, now); gain.gain.exponentialRampToValueAtTime(.001, now + .25); break;
      case 'tumba':
        osc.type = 'square'; osc.frequency.setValueAtTime(90 * combo, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + .35);
        gain.gain.setValueAtTime(.3, now); gain.gain.exponentialRampToValueAtTime(.001, now + .4); break;
      case 'cempasuchil':
        osc.type = 'sine'; osc.frequency.setValueAtTime(987.77 * combo, now);
        osc.frequency.exponentialRampToValueAtTime(1318.5, now + .2);
        gain.gain.setValueAtTime(.18, now); gain.gain.exponentialRampToValueAtTime(.001, now + .25); break;
      default:
        osc.type = 'sine'; osc.frequency.setValueAtTime(440 * combo, now);
        gain.gain.setValueAtTime(.2, now); gain.gain.exponentialRampToValueAtTime(.001, now + .2);
    }
    osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + .4);
  }
  playCrashSound() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain(), now = this.ctx.currentTime;
    osc.type = 'square'; osc.frequency.setValueAtTime(160, now); osc.frequency.exponentialRampToValueAtTime(60, now + .12);
    gain.gain.setValueAtTime(.22, now); gain.gain.exponentialRampToValueAtTime(.001, now + .14);
    osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + .14);
  }
  playThunderSound() {
    if (this.isMuted || !this.ctx) return;
    const n = this.ctx.sampleRate * .4, buffer = this.ctx.createBuffer(1, n, this.ctx.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    const gain = this.ctx.createGain(); gain.gain.setValueAtTime(.3, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.01, this.ctx.currentTime + .4);
    noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination); noise.start();
  }
  playFallo() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain(), now = this.ctx.currentTime;
    osc.type = 'sine'; osc.frequency.setValueAtTime(130, now);
    gain.gain.setValueAtTime(.12, now); gain.gain.exponentialRampToValueAtTime(.001, now + .1);
    osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + .1);
  }
}
const audio = new AudioEngine();

// ================== LIENZO Y RECURSOS ==================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const MAX_OBJECTS = 25;

const fondo = new Image(); fondo.src = 'assets/fondo.svg';

const SPRITE_TYPES = [
  { name: 'calavera', archivo: 'assets/calavera.svg', color: '#e0aaff' },
  { name: 'calabaza', archivo: 'assets/calabaza.svg', color: '#ff9e00' },
  { name: 'fantasma', archivo: 'assets/fantasma.svg', color: '#00f5d4' },
  { name: 'murcielago', archivo: 'assets/murcielago.svg', color: '#7b2cbf' },
  { name: 'vela', archivo: 'assets/vela.svg', color: '#ffd166' },
  { name: 'tumba', archivo: 'assets/tumba.svg', color: '#8d96a8' },
  { name: 'cempasuchil', archivo: 'assets/cempasuchil.svg', color: '#ffae00' },
];
SPRITE_TYPES.forEach(t => { t.img = new Image(); t.img.src = t.archivo; });

const MOVEMENT_TYPES = ['arriba', 'abajo', 'diagonal', 'circular'];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

let spirits = [], particles = [], floatingTexts = [], rainDrops = [];
let score = 0, totalClicks = 0, hits = 0, combo = 0, lastHitTime = 0, best = Number(localStorage.getItem('cazaEspiritusBest') || 0);
let mouse = { x: -1000, y: -1000 };
let lightningOpacity = 0;

// ================== CLASE ESPÍRITU ==================
class Spirit {
  constructor() { this.reset(true); }

  // Reconfigura por completo: nuevo tipo, movimiento, velocidad y posición aleatoria.
  // Así se cumple "aparecer/desaparecer con aleatoriedad en el desplazamiento".
  reset(primerLote = false, lejosDe = null) {
    this.radius = rnd(16, 30);
    this.tipo = pick(SPRITE_TYPES);
    this.movement = pick(MOVEMENT_TYPES);
    const velocidad = rnd(55, 150);

    do { this.x = rnd(this.radius + 10, W - this.radius - 10); this.y = rnd(this.radius + 10, H - this.radius - 10); }
    while (lejosDe && Math.hypot(this.x - lejosDe.x, this.y - lejosDe.y) < 160);

    this.vx = 0; this.vy = 0;
    this.angle = rnd(0, Math.PI * 2);
    this.angularSpeed = rnd(0.9, 2.2) * pick([-1, 1]);
    this.orbitRadius = rnd(16, 42);
    const margen = this.orbitRadius + this.radius + 14;
    this.centerX = rnd(margen, W - margen);
    this.centerY = rnd(margen, H - margen);
    this.centerVx = rnd(-18, 18); this.centerVy = rnd(-18, 18);
    this.dirDiag = rnd(0, Math.PI * 2);
    this.wiggleSeed = rnd(0, 100);
    this.speedBase = velocidad;

    this.vidaMax = rnd(6, 13);
    this.vida = this.vidaMax;
    this.kickTimer = 0;
    this.squash = 0;
    this.alpha = 0;
    this.estado = 'entrando';
  }

  // Dirección/velocidad propia de cada patrón de movimiento (arriba/abajo/diagonal/circular)
  dirigir(dt, t) {
    switch (this.movement) {
      case 'arriba':
        this.vy = -this.speedBase;
        this.vx = Math.sin(t * 1.3 + this.wiggleSeed) * this.speedBase * 0.25;
        break;
      case 'abajo':
        this.vy = this.speedBase;
        this.vx = Math.sin(t * 1.3 + this.wiggleSeed) * this.speedBase * 0.25;
        break;
      case 'diagonal':
        if (this.vx === 0 && this.vy === 0) { this.vx = Math.cos(this.dirDiag) * this.speedBase; this.vy = Math.sin(this.dirDiag) * this.speedBase; }
        break;
      case 'circular':
        this.angle += this.angularSpeed * dt;
        if (this.centerX < 30) this.centerVx = Math.abs(this.centerVx);
        if (this.centerX > W - 30) this.centerVx = -Math.abs(this.centerVx);
        if (this.centerY < 30) this.centerVy = Math.abs(this.centerVy);
        if (this.centerY > H - 30) this.centerVy = -Math.abs(this.centerVy);
        this.centerX += this.centerVx * dt; this.centerY += this.centerVy * dt;
        {
          const nx = this.centerX + Math.cos(this.angle) * this.orbitRadius;
          const ny = this.centerY + Math.sin(this.angle) * this.orbitRadius;
          this.vx = (nx - this.x) / dt; this.vy = (ny - this.y) / dt; this.x = nx; this.y = ny;
        }
        return; // posición ya actualizada paramétricamente
    }
    this.x += this.vx * dt; this.y += this.vy * dt;
  }

  rebotarParedes() {
    if (this.x < this.radius) { this.x = this.radius; this.vx = Math.abs(this.vx); if (this.movement === 'diagonal') this.dirDiag = Math.PI - this.dirDiag; }
    if (this.x > W - this.radius) { this.x = W - this.radius; this.vx = -Math.abs(this.vx); if (this.movement === 'diagonal') this.dirDiag = Math.PI - this.dirDiag; }
    if (this.y < this.radius) { this.y = this.radius; this.vy = Math.abs(this.vy); if (this.movement === 'diagonal') this.dirDiag = -this.dirDiag; }
    if (this.y > H - this.radius) { this.y = H - this.radius; this.vy = -Math.abs(this.vy); if (this.movement === 'diagonal') this.dirDiag = -this.dirDiag; }
  }

  update(dt, t) {
    if (this.kickTimer > 0) {
      // Fase balística breve tras un choque: se deja llevar por el impulso del rebote
      this.x += this.vx * dt; this.y += this.vy * dt;
      this.rebotarParedes();
      this.kickTimer -= dt;
      if (this.kickTimer <= 0 && this.movement === 'circular') {
        this.centerX = this.x - Math.cos(this.angle) * this.orbitRadius;
        this.centerY = this.y - Math.sin(this.angle) * this.orbitRadius;
      }
    } else {
      this.dirigir(dt, t);
      if (this.movement !== 'circular') this.rebotarParedes();
    }

    if (this.squash > 0) this.squash -= dt * 4;

    if (this.estado === 'entrando') { this.alpha += dt * 1.6; if (this.alpha >= 1) { this.alpha = 1; this.estado = 'vivo'; } }
    else if (this.estado === 'vivo') { this.vida -= dt; if (this.vida <= 0) this.estado = 'saliendo'; }
    else if (this.estado === 'saliendo') { this.alpha -= dt * 1.6; if (this.alpha <= 0) { this.alpha = 0; this.reset(); } }
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    const esc = 1 - Math.max(0, this.squash) * 0.35;
    ctx.scale(esc, 2 - esc);
    ctx.shadowColor = this.tipo.color; ctx.shadowBlur = 14;
    const img = this.tipo.img;
    if (img.complete && img.naturalWidth) ctx.drawImage(img, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    ctx.restore();
  }
}

function createSparks(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, sp = rnd(60, 220);
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, radius: rnd(1.5, 3.5), color, alpha: 1, vida: rnd(.3, .6) });
  }
}
function addFloatingText(text, x, y, color = '#ff9e00') { floatingTexts.push({ text, x, y, color, alpha: 1 }); }

// Animación breve que alude a un choque: onda expansiva + chispas + "squash" + texto
function efectoChoque(x, y) {
  particles.push({ onda: true, x, y, t: 0, dur: .4 });
  createSparks(x, y, '#ffd166', 10);
  addFloatingText('¡Choque!', x, y - 10, '#ff9e00');
  audio.playCrashSound();
}

function resolverColisiones() {
  for (let i = 0; i < spirits.length; i++) {
    for (let j = i + 1; j < spirits.length; j++) {
      const a = spirits[i], b = spirits[j];
      if (a.alpha < .5 || b.alpha < .5) continue;
      const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || .001, minDist = a.radius + b.radius;
      if (dist >= minDist) continue;
      const nx = dx / dist, ny = dy / dist, overlap = (minDist - dist) / 2;
      a.x -= nx * overlap; a.y -= ny * overlap; b.x += nx * overlap; b.y += ny * overlap;

      const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (rel > 0) {
        a.vx -= rel * nx; a.vy -= rel * ny;
        b.vx += rel * nx; b.vy += rel * ny;
      }
      a.kickTimer = b.kickTimer = 0.25;
      a.squash = b.squash = 1;
      if (!a.ultimoChoque || performance.now() - a.ultimoChoque > 180) efectoChoque((a.x + b.x) / 2, (a.y + b.y) / 2);
      a.ultimoChoque = b.ultimoChoque = performance.now();
    }
  }
}

// ================== AMBIENTE (lluvia, luna, viñeta) ==================
function initRain() { for (let i = 0; i < 35; i++) rainDrops.push({ x: rnd(0, W), y: rnd(0, H), len: rnd(6, 16), speed: rnd(160, 300) }); }

function drawBackground(dt) {
  if (fondo.complete && fondo.naturalWidth) ctx.drawImage(fondo, 0, 0, W, H);
  else { ctx.fillStyle = '#030107'; ctx.fillRect(0, 0, W, H); }

  ctx.strokeStyle = 'rgba(157, 78, 221, .18)';
  rainDrops.forEach(d => {
    ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y + d.len); ctx.stroke();
    d.y += d.speed * dt; if (d.y > H) { d.y = -10; d.x = rnd(0, W); }
  });

  if (gameState === 'PLAYING' && Math.random() < 0.0015) { lightningOpacity = .3; audio.playThunderSound(); }
  if (lightningOpacity > 0) { ctx.fillStyle = `rgba(224,170,255,${lightningOpacity})`; ctx.fillRect(0, 0, W, H); lightningOpacity -= .015; }
}

function drawSpotlight() {
  const g = ctx.createRadialGradient(mouse.x, mouse.y, 20, mouse.x, mouse.y, 190);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(3,1,7,.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ================== BUCLE PRINCIPAL ==================
let prevT = performance.now(), tAcum = 0;
function gameLoop(now) {
  const dt = Math.min(.05, (now - prevT) / 1000); prevT = now; tAcum += dt;
  ctx.clearRect(0, 0, W, H);
  drawBackground(dt);

  if (gameState === 'PLAYING') { spirits.forEach(s => s.update(dt, tAcum)); resolverColisiones(); }
  spirits.forEach(s => s.draw());

  particles.forEach((p, idx) => {
    if (p.onda) {
      p.t += dt; const k = p.t / p.dur;
      ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3 * (1 - k) + 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 6 + k * 34, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      if (p.t >= p.dur) particles.splice(idx, 1);
      return;
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill();
    p.x += p.vx * dt; p.y += p.vy * dt; p.alpha -= dt / p.vida;
    if (p.alpha <= 0) particles.splice(idx, 1);
  });
  ctx.globalAlpha = 1;

  floatingTexts.forEach((f, idx) => {
    ctx.font = "bold 16px 'Orbitron', sans-serif"; ctx.textAlign = 'center'; ctx.fillStyle = f.color; ctx.globalAlpha = f.alpha;
    ctx.fillText(f.text, f.x, f.y); f.y -= 42 * dt; f.alpha -= dt * 1.3;
    if (f.alpha <= 0) floatingTexts.splice(idx, 1);
  });
  ctx.globalAlpha = 1;

  drawSpotlight();

  if (gameState === 'PAUSED') {
    ctx.fillStyle = 'rgba(5,2,10,.75)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ff9e00'; ctx.font = "bold 42px 'Creepster', cursive"; ctx.textAlign = 'center';
    ctx.fillText('JUEGO EN PAUSA', W / 2, H / 2);
  }
  requestAnimationFrame(gameLoop);
}

// ================== INTERACCIÓN DEL MOUSE ==================
function coordsLogicas(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
}
function espirituEn(p) {
  for (let i = spirits.length - 1; i >= 0; i--) {
    const s = spirits[i];
    if (s.alpha > .5 && Math.hypot(p.x - s.x, p.y - s.y) <= s.radius * 1.25) return s;
  }
  return null;
}
canvas.addEventListener('mousemove', e => {
  mouse = coordsLogicas(e);
  document.body.classList.toggle('sobre-objetivo', gameState === 'PLAYING' && !!espirituEn(mouse));
});
canvas.addEventListener('mouseleave', () => { mouse = { x: -1000, y: -1000 }; document.body.classList.remove('sobre-objetivo'); });

canvas.addEventListener('click', e => {
  if (gameState !== 'PLAYING') return;
  audio.init();
  const p = coordsLogicas(e);
  totalClicks++;
  const s = espirituEn(p);
  if (s) {
    hits++;
    combo = (Date.now() - lastHitTime < 1200) ? combo + 1 : 1;
    lastHitTime = Date.now();
    const puntos = 100 * combo;
    score += puntos;
    if (score > best) { best = score; localStorage.setItem('cazaEspiritusBest', String(best)); }

    createSparks(s.x, s.y, s.tipo.color, 20);
    addFloatingText('+' + puntos + (combo > 1 ? ' x' + combo : ''), s.x, s.y, s.tipo.color);
    audio.playCaptureSound(s.tipo.name, combo);
    s.estado = 'saliendo'; s.vida = 0;          // se desvanece y reaparece en otra zona (sigue habiendo 25)
    s.reset(false, p);
  } else { combo = 0; audio.playFallo(); }
  updateHUD();
});

function updateHUD() {
  document.getElementById('capturedText').textContent = hits;
  document.getElementById('scoreText').textContent = score;
  document.getElementById('comboText').textContent = 'x' + Math.max(1, combo);
  document.getElementById('accuracyText').textContent = (totalClicks > 0 ? Math.round(hits / totalClicks * 100) : 100) + '%';
  document.getElementById('bestText').textContent = best;
}

// ================== CONTROLES DE PARTIDA ==================
function resetGame() {
  score = 0; totalClicks = 0; hits = 0; combo = 0;
  spirits = []; for (let i = 0; i < MAX_OBJECTS; i++) spirits.push(new Spirit());
  updateHUD();
}

document.getElementById('btnStartGame').addEventListener('click', () => {
  audio.init(); audio.isMuted = false;
  document.getElementById('audioIcon').textContent = '🔊'; document.getElementById('audioText').textContent = 'Audio Activado';
  resetGame(); gameState = 'PLAYING'; audio.playMusic();

  const overlay = document.getElementById('welcomeOverlay');
  overlay.style.opacity = '0'; setTimeout(() => overlay.style.display = 'none', 400);
  document.getElementById('btnPause').removeAttribute('disabled');
  document.getElementById('btnRestart').removeAttribute('disabled');
});
document.getElementById('btnPause').addEventListener('click', () => {
  if (gameState !== 'PLAYING') return;
  gameState = 'PAUSED'; audio.stopMusic();
  document.getElementById('btnPause').style.display = 'none';
  document.getElementById('btnResume').style.display = 'inline-block';
  document.getElementById('btnResume').removeAttribute('disabled');
});
document.getElementById('btnResume').addEventListener('click', () => {
  if (gameState !== 'PAUSED') return;
  gameState = 'PLAYING'; if (!audio.isMuted) audio.playMusic();
  document.getElementById('btnResume').style.display = 'none';
  document.getElementById('btnPause').style.display = 'inline-block';
});
document.getElementById('btnRestart').addEventListener('click', () => {
  resetGame(); gameState = 'PLAYING';
  if (!audio.isMuted) audio.playMusic();
  document.getElementById('btnResume').style.display = 'none';
  document.getElementById('btnPause').style.display = 'inline-block';
});
document.getElementById('btnAudio').addEventListener('click', () => {
  audio.init(); audio.isMuted = !audio.isMuted;
  document.getElementById('audioIcon').textContent = audio.isMuted ? '🔇' : '🔊';
  document.getElementById('audioText').textContent = audio.isMuted ? 'Audio Místico' : 'Audio Activado';
  if (audio.isMuted) audio.stopMusic(); else if (gameState === 'PLAYING') audio.playMusic();
});

// ================== INICIO ==================
function init() {
  for (let i = 0; i < MAX_OBJECTS; i++) spirits.push(new Spirit());
  initRain();
  document.getElementById('bestText').textContent = best;
  requestAnimationFrame(t => { prevT = t; requestAnimationFrame(gameLoop); });
}
window.onload = init;
