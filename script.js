const buttons = document.querySelectorAll('.time-btn');
const selectedLabel = document.getElementById('selectedLabel');
const countdown = document.getElementById('countdown');
const topSand = document.getElementById('topSand');
const topSandHighlight = document.getElementById('topSandHighlight');
const bottomSand = document.getElementById('bottomSand');
const bottomSandHighlight = document.getElementById('bottomSandHighlight');
const sandStream = document.getElementById('sandStream');
const streamSpark = document.getElementById('streamSpark');

let animationFrameId = null;
let startTime = 0;
let endTime = 0;
let totalMs = 0;

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => 0.5 - Math.cos(Math.PI * clamp(t)) / 2;

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildTopSandPath(progress) {
  const p = clamp(progress);
  const levelY = lerp(82, 176, Math.pow(p, 0.92));
  const sinkDepth = lerp(6, 18, p);
  const centerY = Math.min(184, levelY + sinkDepth);
  const leftY = levelY + lerp(2, 5, p);
  const rightY = levelY + lerp(1, 4, p);
  const leftShoulderX = 66;
  const rightShoulderX = 194;
  const cp1x = 101;
  const cp2x = 159;
  const cpEdgeLift = lerp(10, 4, p);

  return [
    `M 58 60`,
    `L 202 60`,
    `L ${rightShoulderX} ${rightY}`,
    `C ${cp2x + 18} ${rightY - cpEdgeLift}, 149 ${centerY - 4}, 130 ${centerY}`,
    `C 111 ${centerY - 4}, ${cp1x - 18} ${leftY - cpEdgeLift}, ${leftShoulderX} ${leftY}`,
    `L 58 60`,
    'Z'
  ].join(' ');
}

function buildTopHighlightPath(progress) {
  const p = clamp(progress);
  const levelY = lerp(84, 174, Math.pow(p, 0.9));
  const centerY = Math.min(182, levelY + lerp(4, 13, p));

  return [
    `M 76 74`,
    `C 108 68, 151 68, 182 76`,
    `L 172 ${levelY - 3}`,
    `C 153 ${levelY - 9}, 123 ${centerY - 10}, 95 ${levelY - 2}`,
    'Z'
  ].join(' ');
}

function buildBottomSandPath(progress) {
  const p = clamp(progress);
  const mound = easeInOut(p);
  const baseHalf = lerp(8, 75, Math.pow(mound, 0.92));
  const apexY = lerp(352, 242, Math.pow(mound, 0.78));
  const leftBaseX = 130 - baseHalf;
  const rightBaseX = 130 + baseHalf;
  const shoulderY = lerp(359, 333, mound);
  const cpSpread = lerp(4, 28, mound);
  const slopeSoftness = lerp(1, 18, mound);

  return [
    `M ${leftBaseX} 360`,
    `C ${leftBaseX + cpSpread} ${shoulderY}, 112 ${apexY + slopeSoftness}, 130 ${apexY}`,
    `C 148 ${apexY + slopeSoftness}, ${rightBaseX - cpSpread} ${shoulderY}, ${rightBaseX} 360`,
    'Z'
  ].join(' ');
}

function buildBottomHighlightPath(progress) {
  const p = clamp(progress);
  const mound = easeInOut(p);
  const baseHalf = lerp(6, 52, Math.pow(mound, 0.88));
  const apexY = lerp(351, 255, Math.pow(mound, 0.8));
  const leftX = 130 - baseHalf;
  const rightX = 130 + baseHalf;

  return [
    `M ${leftX + 8} 357`,
    `C ${leftX + 18} ${apexY + 40}, 120 ${apexY + 12}, 130 ${apexY + 7}`,
    `C 141 ${apexY + 13}, ${rightX - 16} ${apexY + 36}, ${rightX - 8} 357`,
    'Z'
  ].join(' ');
}

function buildStreamPath(progress, now) {
  if (progress >= 1) {
    return '';
  }

  const wobble = Math.sin(now / 110) * 0.7;
  const widthTop = 3.2 + Math.sin(now / 85) * 0.25;
  const widthBottom = 2.4 + Math.cos(now / 90) * 0.25;
  const startY = 184;
  const endY = 234;
  const x = 130 + wobble;

  return [
    `M ${x - widthTop} ${startY}`,
    `C ${x - widthTop * 0.55} 198, ${x - widthBottom} 216, ${x - widthBottom} ${endY}`,
    `L ${x + widthBottom} ${endY}`,
    `C ${x + widthBottom} 216, ${x + widthTop * 0.55} 198, ${x + widthTop} ${startY}`,
    'Z'
  ].join(' ');
}

function setProgress(progress, now = performance.now()) {
  const p = clamp(progress);
  topSand.setAttribute('d', buildTopSandPath(p));
  topSandHighlight.setAttribute('d', buildTopHighlightPath(p));
  bottomSand.setAttribute('d', buildBottomSandPath(p));
  bottomSandHighlight.setAttribute('d', buildBottomHighlightPath(p));

  if (p >= 1) {
    sandStream.setAttribute('d', '');
    sandStream.style.opacity = '0';
    streamSpark.setAttribute('opacity', '0');
    return;
  }

  sandStream.setAttribute('d', buildStreamPath(p, now));
  sandStream.style.opacity = String(0.92 - p * 0.08);

  const pulse = (Math.sin(now / 95) + 1) / 2;
  streamSpark.setAttribute('cx', String(130 + Math.sin(now / 110) * 0.85));
  streamSpark.setAttribute('cy', String(233.4 + Math.cos(now / 120) * 0.6));
  streamSpark.setAttribute('r', String(2.6 + pulse * 1.7));
  streamSpark.setAttribute('opacity', String(0.35 + pulse * 0.45));
}

function stopTimer(finished = false) {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (finished) {
    setProgress(1, performance.now());
    countdown.textContent = '00:00';
  } else {
    streamSpark.setAttribute('opacity', '0');
    sandStream.style.opacity = '0';
  }
}

function tick(now) {
  const remaining = endTime - now;
  const progress = 1 - remaining / totalMs;
  setProgress(progress, now);
  countdown.textContent = formatTime(remaining);

  if (remaining <= 0) {
    stopTimer(true);
    return;
  }

  animationFrameId = requestAnimationFrame(tick);
}

function startTimer(minutes, button) {
  stopTimer(false);

  totalMs = minutes * 60 * 1000;
  startTime = performance.now();
  endTime = startTime + totalMs;

  buttons.forEach((btn) => btn.classList.remove('active'));
  button.classList.add('active');

  selectedLabel.textContent = `${minutes}분`;
  countdown.textContent = formatTime(totalMs);
  setProgress(0, startTime);

  animationFrameId = requestAnimationFrame(tick);
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const minutes = Number(button.dataset.minutes);
    startTimer(minutes, button);
  });
});

setProgress(0, performance.now());
countdown.textContent = '00:00';
