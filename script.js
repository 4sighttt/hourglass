const buttons = document.querySelectorAll('.time-btn');
const selectedLabel = document.getElementById('selectedLabel');
const countdown = document.getElementById('countdown');
const topSand = document.getElementById('topSand');
const bottomSand = document.getElementById('bottomSand');
const topSandHighlight = document.getElementById('topSandHighlight');
const bottomSandHighlight = document.getElementById('bottomSandHighlight');
const sandStream = document.getElementById('sandStream');

let timerId = null;
let endTime = 0;
let totalMs = 60 * 1000;
let currentMinutes = 1;

const TOP = {
  left: 92,
  right: 248,
  topY: 86,
  neckLeft: 162,
  neckRight: 178,
  neckY: 208,
  maxDepth: 118,
  centerX: 170
};

const BOTTOM = {
  left: 92,
  right: 248,
  baseY: 388,
  neckLeft: 162,
  neckRight: 178,
  neckY: 254,
  centerX: 170,
  maxHeight: 108,
  maxHalfWidth: 78
};

function clamp(v, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function easeInOut(v) {
  const p = clamp(v);
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function topSandPath(fill) {
  const p = clamp(fill);
  if (p <= 0.001) return '';

  const y = TOP.neckY - TOP.maxDepth * p;
  const inset = 10 * (1 - p);
  const leftX = TOP.left + inset;
  const rightX = TOP.right - inset;
  const curve = 6 + 9 * p;

  return [
    `M ${leftX} ${y}`,
    `Q ${TOP.centerX} ${y - curve} ${rightX} ${y}`,
    `L ${TOP.neckRight} ${TOP.neckY}`,
    `L ${TOP.neckLeft} ${TOP.neckY}`,
    'Z'
  ].join(' ');
}

function topHighlightPath(fill) {
  const p = clamp(fill);
  if (p <= 0.001) return '';

  const y = TOP.neckY - TOP.maxDepth * p;
  const inset = 18 * (1 - p) + 8;
  const leftX = TOP.left + inset;
  const rightX = TOP.right - inset;
  const curve = 4 + 6 * p;
  const depth = Math.min(24, 10 + 12 * p);

  return [
    `M ${leftX} ${y + 3}`,
    `Q ${TOP.centerX} ${y - curve} ${rightX} ${y + 3}`,
    `Q ${TOP.centerX} ${y + depth} ${leftX} ${y + 3}`,
    'Z'
  ].join(' ');
}

function bottomSandPath(fill) {
  const p = clamp(fill);
  if (p <= 0.001) return '';

  const height = BOTTOM.maxHeight * Math.pow(p, 0.96);
  const half = Math.max(4, BOTTOM.maxHalfWidth * Math.pow(p, 0.98));
  const peakY = BOTTOM.baseY - height;
  const leftX = BOTTOM.centerX - half;
  const rightX = BOTTOM.centerX + half;
  const baseLift = Math.min(12, 10 * p);
  const shoulderY = peakY + 18 + (1 - p) * 4;

  return [
    `M ${leftX} ${BOTTOM.baseY}`,
    `Q ${BOTTOM.centerX} ${BOTTOM.baseY - baseLift} ${rightX} ${BOTTOM.baseY}`,
    `Q ${BOTTOM.centerX + half * 0.72} ${shoulderY} ${BOTTOM.centerX} ${peakY}`,
    `Q ${BOTTOM.centerX - half * 0.72} ${shoulderY} ${leftX} ${BOTTOM.baseY}`,
    'Z'
  ].join(' ');
}

function bottomHighlightPath(fill) {
  const p = clamp(fill);
  if (p <= 0.001) return '';

  const height = BOTTOM.maxHeight * Math.pow(p, 0.96);
  const half = Math.max(4, BOTTOM.maxHalfWidth * Math.pow(p, 0.98)) * 0.68;
  const peakY = BOTTOM.baseY - height * 0.76;
  const leftX = BOTTOM.centerX - half;
  const rightX = BOTTOM.centerX + half;
  const depth = 12 + 8 * p;

  return [
    `M ${leftX} ${BOTTOM.baseY - 8}`,
    `Q ${BOTTOM.centerX} ${BOTTOM.baseY - 14 - 8 * p} ${rightX} ${BOTTOM.baseY - 8}`,
    `Q ${BOTTOM.centerX + half * 0.38} ${peakY + depth} ${BOTTOM.centerX} ${peakY}`,
    `Q ${BOTTOM.centerX - half * 0.38} ${peakY + depth} ${leftX} ${BOTTOM.baseY - 8}`,
    'Z'
  ].join(' ');
}

function setProgress(progress) {
  const raw = clamp(progress);
  const p = easeInOut(raw);
  const topFill = 1 - p;
  const bottomFill = p;

  topSand.setAttribute('d', topSandPath(topFill));
  topSandHighlight.setAttribute('d', topHighlightPath(topFill));
  bottomSand.setAttribute('d', bottomSandPath(bottomFill));
  bottomSandHighlight.setAttribute('d', bottomHighlightPath(bottomFill));

  sandStream.setAttribute('opacity', raw >= 1 ? '0' : '1');

  const streamHeight = 42 + 18 * Math.sin(raw * Math.PI);
  sandStream.setAttribute('y', '206');
  sandStream.setAttribute('height', String(streamHeight));
}

function stopTimer(finished = false) {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  sandStream.setAttribute('opacity', '0');

  if (finished) {
    setProgress(1);
    countdown.textContent = '00:00';
  }
}

function tick() {
  const remaining = endTime - Date.now();
  const progress = 1 - remaining / totalMs;
  setProgress(progress);
  countdown.textContent = formatTime(remaining);

  if (remaining <= 0) {
    stopTimer(true);
  }
}

function startTimer(minutes, button) {
  stopTimer(false);

  currentMinutes = minutes;
  totalMs = minutes * 60 * 1000;
  endTime = Date.now() + totalMs;

  buttons.forEach((btn) => btn.classList.remove('active'));
  button.classList.add('active');

  selectedLabel.textContent = `${minutes}분`;
  countdown.textContent = formatTime(totalMs);
  setProgress(0);
  sandStream.setAttribute('opacity', '1');

  timerId = setInterval(tick, 100);
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const minutes = Number(button.dataset.minutes);
    startTimer(minutes, button);
  });
});

setProgress(0);
selectedLabel.textContent = `${currentMinutes}분`;
countdown.textContent = formatTime(totalMs);
