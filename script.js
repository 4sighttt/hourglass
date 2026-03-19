const buttons = document.querySelectorAll('.time-btn');
const selectedLabel = document.getElementById('selectedLabel');
const countdown = document.getElementById('countdown');
const topSand = document.getElementById('topSand');
const topSandGlow = document.getElementById('topSandGlow');
const bottomBase = document.getElementById('bottomBase');
const bottomPile = document.getElementById('bottomPile');
const bottomGlow = document.getElementById('bottomGlow');
const sandStream = document.getElementById('sandStream');
const streamSpark = document.getElementById('streamSpark');

let animationId = null;
let endTime = 0;
let totalMs = 0;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => t * t * (3 - 2 * t);

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildTopSandPath(progress) {
  const p = clamp(progress);
  const level = easeInOut(p);
  const surfaceY = lerp(72, 178, level);
  const inset = lerp(10, 67, level);
  const leftX = 52 + inset;
  const rightX = 208 - inset;
  const dip = lerp(3, 10, 1 - level);
  const neckInset = lerp(10, 2, level);
  const neckLeftX = 122 + neckInset;
  const neckRightX = 138 - neckInset;
  const bottomY = 186;

  return [
    `M ${leftX} ${surfaceY}`,
    `Q 130 ${surfaceY - dip} ${rightX} ${surfaceY}`,
    `L ${neckRightX} ${bottomY}`,
    `L ${neckLeftX} ${bottomY}`,
    'Z'
  ].join(' ');
}

function buildBottomBasePath(progress) {
  const p = clamp(progress);
  const level = easeInOut(p);
  const fillHeight = lerp(0, 118, level);
  const y = 360 - fillHeight;
  const leftX = lerp(128, 70, level);
  const rightX = 260 - leftX;
  const curveLift = lerp(0, 16, level);

  return [
    `M 52 360`,
    `L 208 360`,
    `L ${rightX} ${y}`,
    `Q 130 ${y - curveLift} ${leftX} ${y}`,
    'Z'
  ].join(' ');
}

function buildBottomPilePath(progress, timeMs) {
  const p = clamp(progress);
  if (p <= 0.001) {
    return 'M 130 360 L 130 360 L 130 360 Z';
  }

  const level = easeInOut(p);
  const pileHeight = lerp(0, 124, level);
  const halfWidth = lerp(0, 68, level);
  const apexY = 360 - pileHeight;
  const wave = Math.sin(timeMs / 180) * Math.max(0.8, 3.2 * (1 - p));
  const leftBaseX = 130 - halfWidth;
  const rightBaseX = 130 + halfWidth;

  return [
    `M ${leftBaseX} 360`,
    `Q ${108 - wave} ${360 - pileHeight * 0.34} 130 ${apexY}`,
    `Q ${152 + wave} ${360 - pileHeight * 0.34} ${rightBaseX} 360`,
    'Z'
  ].join(' ');
}

function updateScene(progress, timeMs = performance.now()) {
  const p = clamp(progress);
  topSand.setAttribute('d', buildTopSandPath(p));
  bottomBase.setAttribute('d', buildBottomBasePath(p));
  bottomPile.setAttribute('d', buildBottomPilePath(p, timeMs));

  const topGlowY = lerp(88, 170, easeInOut(p));
  const topGlowOpacity = lerp(0.34, 0.12, p);
  topSandGlow.setAttribute('cy', String(topGlowY));
  topSandGlow.setAttribute('opacity', String(topGlowOpacity));

  const bottomGlowY = lerp(352, 318, easeInOut(p));
  const bottomGlowRx = lerp(12, 48, easeInOut(p));
  bottomGlow.setAttribute('cy', String(bottomGlowY));
  bottomGlow.setAttribute('rx', String(bottomGlowRx));
  bottomGlow.setAttribute('opacity', String(lerp(0.08, 0.24, p)));

  if (p >= 1) {
    sandStream.setAttribute('opacity', '0');
    streamSpark.setAttribute('opacity', '0');
    sandStream.setAttribute('height', '54');
    sandStream.setAttribute('y', '184');
    return;
  }

  const pulse = (Math.sin(timeMs / 70) + 1) * 0.5;
  const width = lerp(4.2, 6.4, pulse);
  const x = 130 - width / 2;
  const streamHeight = lerp(52, 58, pulse);
  const y = 184 + lerp(0, 3, pulse);

  sandStream.setAttribute('x', x.toFixed(2));
  sandStream.setAttribute('width', width.toFixed(2));
  sandStream.setAttribute('height', streamHeight.toFixed(2));
  sandStream.setAttribute('y', y.toFixed(2));
  sandStream.setAttribute('rx', (width / 2).toFixed(2));
  sandStream.setAttribute('opacity', '1');

  streamSpark.setAttribute('cy', String(210 + Math.sin(timeMs / 100) * 2));
  streamSpark.setAttribute('opacity', String(0.1 + pulse * 0.12));
}

function stopTimer(finished = false) {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (finished) {
    updateScene(1);
    countdown.textContent = '00:00';
    return;
  }

  sandStream.setAttribute('opacity', '0');
  streamSpark.setAttribute('opacity', '0');
}

function animate() {
  const remaining = endTime - Date.now();
  const progress = 1 - remaining / totalMs;

  updateScene(progress);
  countdown.textContent = formatTime(remaining);

  if (remaining <= 0) {
    stopTimer(true);
    return;
  }

  animationId = requestAnimationFrame(animate);
}

function startTimer(minutes, button) {
  stopTimer(false);

  totalMs = minutes * 60 * 1000;
  endTime = Date.now() + totalMs;

  buttons.forEach((btn) => btn.classList.remove('active'));
  button.classList.add('active');

  selectedLabel.textContent = `${minutes}분`;
  countdown.textContent = formatTime(totalMs);
  updateScene(0);
  animationId = requestAnimationFrame(animate);
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const minutes = Number(button.dataset.minutes);
    startTimer(minutes, button);
  });
});

updateScene(0);
countdown.textContent = '00:00';
