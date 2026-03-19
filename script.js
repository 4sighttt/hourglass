const buttons = document.querySelectorAll('.time-btn');
const selectedLabel = document.getElementById('selectedLabel');
const countdown = document.getElementById('countdown');
const sandTop = document.getElementById('sandTop');
const sandBottom = document.getElementById('sandBottom');
const sandPile = document.getElementById('sandPile');
const stream = document.getElementById('stream');

let timerId = null;
let endTime = 0;
let totalMs = 0;

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setProgress(progress) {
  const p = clamp(progress, 0, 1);
  const topScale = Math.max(0.03, 1 - p);
  const bottomScale = Math.max(0.03, p);
  const pileScale = Math.max(0.02, p);

  sandTop.style.transform = `translateX(-50%) scaleY(${topScale})`;
  sandBottom.style.transform = `translateX(-50%) scaleY(${bottomScale})`;
  sandPile.style.transform = `translateX(-50%) scale(${pileScale})`;
  sandPile.style.opacity = `${0.2 + p * 0.8}`;
}

function clearTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function stopTimer(finished = false) {
  clearTimer();
  stream.classList.remove('running');

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
  clearTimer();

  totalMs = minutes * 60 * 1000;
  endTime = Date.now() + totalMs;

  buttons.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');

  selectedLabel.textContent = `${minutes}분`;
  countdown.textContent = formatTime(totalMs);
  setProgress(0);
  stream.classList.add('running');

  timerId = setInterval(tick, 100);
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const minutes = Number(button.dataset.minutes);
    startTimer(minutes, button);
  });
});

selectedLabel.textContent = '없음';
countdown.textContent = '00:00';
setProgress(0);
