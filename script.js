const buttons = document.querySelectorAll('.time-btn');
const selectedLabel = document.getElementById('selectedLabel');
const countdown = document.getElementById('countdown');
const topSand = document.getElementById('topSand');
const bottomSand = document.getElementById('bottomSand');
const sandStream = document.getElementById('sandStream');

let timerId = null;
let endTime = 0;
let totalMs = 0;

const TOP_TOP_Y = 74;
const TOP_NECK_Y = 173;
const TOP_CENTER_X = 150;
const TOP_MAX_HALF = 84;
const TOP_NECK_HALF = 28;

const BOTTOM_BASE_Y = 356;
const BOTTOM_SHOULDER_Y = 257;
const BOTTOM_CENTER_X = 150;
const BOTTOM_MAX_HALF = 72;
const BOTTOM_CURVE = 22;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setTopSand(progress) {
  const p = clamp(progress, 0, 1);
  const empty = p;
  const levelY = TOP_TOP_Y + (TOP_NECK_Y - TOP_TOP_Y) * Math.pow(empty, 0.92);
  const halfTop = TOP_MAX_HALF - (TOP_MAX_HALF - TOP_NECK_HALF) * Math.pow(empty, 0.78);
  const overfill = 16;

  const points = [
    `${TOP_CENTER_X - halfTop - overfill},${levelY}`,
    `${TOP_CENTER_X + halfTop + overfill},${levelY}`,
    `${TOP_CENTER_X + TOP_NECK_HALF + overfill},${TOP_NECK_Y + 8}`,
    `${TOP_CENTER_X - TOP_NECK_HALF - overfill},${TOP_NECK_Y + 8}`
  ].join(' ');

  topSand.setAttribute('points', points);
}

function setBottomSand(progress) {
  const p = clamp(progress, 0, 1);
  const height = 6 + 93 * Math.pow(p, 0.9);
  const topY = BOTTOM_BASE_Y - height;
  const halfTop = 4 + BOTTOM_MAX_HALF * Math.pow(p, 0.88);
  const belly = Math.min(BOTTOM_MAX_HALF + 6, halfTop + 10 + 10 * p);
  const controlY = BOTTOM_BASE_Y - Math.max(8, height * 0.16);

  const d = [
    `M ${BOTTOM_CENTER_X - halfTop} ${topY}`,
    `Q ${BOTTOM_CENTER_X - belly} ${topY + height * 0.56} ${BOTTOM_CENTER_X - BOTTOM_MAX_HALF} ${BOTTOM_BASE_Y}`,
    `Q ${BOTTOM_CENTER_X} ${controlY} ${BOTTOM_CENTER_X + BOTTOM_MAX_HALF} ${BOTTOM_BASE_Y}`,
    `Q ${BOTTOM_CENTER_X + belly} ${topY + height * 0.56} ${BOTTOM_CENTER_X + halfTop} ${topY}`,
    `Q ${BOTTOM_CENTER_X} ${topY - BOTTOM_CURVE * Math.pow(p, 0.85)} ${BOTTOM_CENTER_X - halfTop} ${topY}`,
    'Z'
  ].join(' ');

  bottomSand.setAttribute('d', d);
}

function setProgress(progress) {
  const p = clamp(progress, 0, 1);
  setTopSand(p);
  setBottomSand(p);
  sandStream.setAttribute('opacity', p >= 1 ? '0' : '1');
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

function startTimer(minutes, button) {
  stopTimer(false);

  totalMs = minutes * 60 * 1000;
  endTime = Date.now() + totalMs;

  buttons.forEach((btn) => btn.classList.remove('active'));
  button.classList.add('active');

  selectedLabel.textContent = `${minutes}분`;
  countdown.textContent = formatTime(totalMs);
  setProgress(0);
  sandStream.setAttribute('opacity', '1');

  timerId = setInterval(() => {
    const remaining = endTime - Date.now();
    const progress = 1 - remaining / totalMs;

    setProgress(progress);
    countdown.textContent = formatTime(remaining);

    if (remaining <= 0) {
      stopTimer(true);
    }
  }, 100);
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const minutes = Number(button.dataset.minutes);
    startTimer(minutes, button);
  });
});

setProgress(0);
countdown.textContent = '00:00';
