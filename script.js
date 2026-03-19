const buttons = document.querySelectorAll('.time-btn');
const selectedLabel = document.getElementById('selectedLabel');
const countdown = document.getElementById('countdown');
const sandTop = document.getElementById('sandTop');
const sandBottom = document.getElementById('sandBottom');
const stream = document.getElementById('stream');

let timerId = null;
let endTime = null;
let totalMs = 0;

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setProgress(progress) {
  const clamped = Math.min(1, Math.max(0, progress));
  sandTop.style.transform = `translateX(-50%) scaleY(${1 - clamped})`;
  sandBottom.style.transform = `translateX(-50%) scaleY(${clamped})`;
}

function stopTimer(finished = false) {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  stream.classList.remove('running');

  if (finished) {
    setProgress(1);
    countdown.textContent = '00:00';
  }
}

function startTimer(minutes, clickedButton) {
  stopTimer(false);

  totalMs = minutes * 60 * 1000;
  endTime = Date.now() + totalMs;

  buttons.forEach((button) => button.classList.remove('active'));
  clickedButton.classList.add('active');

  selectedLabel.textContent = `${minutes}분`;
  countdown.textContent = formatTime(totalMs);
  setProgress(0);
  stream.classList.add('running');

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

countdown.textContent = '00:00';
setProgress(0);