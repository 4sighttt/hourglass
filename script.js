const buttons = document.querySelectorAll('.time-btn');
const selectedLabel = document.getElementById('selectedLabel');
const countdown = document.getElementById('countdown');
const topSand = document.getElementById('topSand');
const bottomSand = document.getElementById('bottomSand');
const sandStream = document.getElementById('sandStream');

let timerId = null;
let endTime = 0;
let totalMs = 0;

const TOP = {
  yTop: 74,
  yNeck: 175,
  leftTop: 74,
  rightTop: 226,
  neckLeft: 123,
  neckRight: 177,
  centerX: 150,
  maxHalf: 76,
};

const BOTTOM = {
  yBase: 356,
  yNeck: 255,
  centerX: 150,
  maxHalf: 76,
};

function clamp(v, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildTopSandPath(progress) {
  const p = clamp(progress);
  const drained = easeInOut(p);
  const y = TOP.yTop + (TOP.yNeck - TOP.yTop) * drained;
  const half = TOP.maxHalf * (1 - drained);
  const left = TOP.centerX - half;
  const right = TOP.centerX + half;
  const lip = 2 + 7 * (1 - drained);

  return [
    `M ${left} ${y}`,
    `Q ${TOP.centerX} ${y - lip}, ${right} ${y}`,
    `L ${TOP.neckRight} ${TOP.yNeck}`,
    `L ${TOP.neckLeft} ${TOP.yNeck}`,
    'Z'
  ].join(' ');
}

function buildBottomSandPath(progress) {
  const p = clamp(progress);
  const filled = easeInOut(p);
  const half = BOTTOM.maxHalf * filled;
  const apexY = BOTTOM.yBase - (BOTTOM.yBase - BOTTOM.yNeck) * filled;
  const left = BOTTOM.centerX - half;
  const right = BOTTOM.centerX + half;
  const baseBulge = 8 + 10 * filled;

  return [
    `M ${left} ${BOTTOM.yBase}`,
    `Q ${BOTTOM.centerX} ${BOTTOM.yBase - baseBulge}, ${right} ${BOTTOM.yBase}`,
    `L ${BOTTOM.centerX} ${apexY}`,
    'Z'
  ].join(' ');
}

function buildStreamPath(progress) {
  const p = clamp(progress);
  if (p >= 1) return '';

  const active = p > 0.01;
  const width = active ? 5 : 0;
  const x = 150 - width / 2;
  const top = 174;
  const bottom = 256;
  const waist = 2.6;

  return [
    `M ${x} ${top}`,
    `L ${x + width} ${top}`,
    `Q ${150 + waist} ${(top + bottom) / 2}, ${150 + 2.2} ${bottom}`,
    `L ${150 - 2.2} ${bottom}`,
    `Q ${150 - waist} ${(top + bottom) / 2}, ${x} ${top}`,
    'Z'
  ].join(' ');
}

function render(progress) {
  const p = clamp(progress);
  topSand.setAttribute('d', buildTopSandPath(p));
  bottomSand.setAttribute('d', buildBottomSandPath(p));
  sandStream.setAttribute('d', buildStreamPath(p));
  sandStream.setAttribute('opacity', p >= 1 ? '0' : '1');
}

function stopTimer(finished = false) {
  if (timerId) {
    cancelAnimationFrame(timerId);
    timerId = null;
  }

  if (finished) {
    countdown.textContent = '00:00';
    render(1);
  } else {
    sandStream.setAttribute('opacity', '0');
  }
}

function tick() {
  const remaining = endTime - performance.now();
  const progress = 1 - remaining / totalMs;
  render(progress);
  countdown.textContent = formatTime(remaining);

  if (remaining <= 0) {
    stopTimer(true);
    return;
  }

  timerId = requestAnimationFrame(tick);
}

function startTimer(minutes, button) {
  stopTimer(false);

  totalMs = minutes * 60 * 1000;
  endTime = performance.now() + totalMs;

  buttons.forEach((btn) => btn.classList.remove('active'));
  button.classList.add('active');

  selectedLabel.textContent = `${minutes}분`;
  countdown.textContent = formatTime(totalMs);
  render(0);

  timerId = requestAnimationFrame(tick);
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const minutes = Number(button.dataset.minutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    startTimer(minutes, button);
  });
});

render(0);
countdown.textContent = '00:00';
