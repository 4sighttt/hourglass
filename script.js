const buttons = document.querySelectorAll('.time-btn');
const selectedLabel = document.getElementById('selectedLabel');
const countdown = document.getElementById('countdown');
const topSand = document.getElementById('topSand');
const bottomSand = document.getElementById('bottomSand');
const sandStream = document.getElementById('sandStream');

let timerId = null;
let endTime = 0;
let totalMs = 0;

const TOP_Y = 60;
const BOTTOM_Y = 360;
const TOP_LEFT = 52;
const TOP_RIGHT = 208;
const NECK_LEFT = 122;
const NECK_RIGHT = 138;
const BOTTOM_CENTER_X = 130;
const BOTTOM_MAX_HALF = 78;
const BOTTOM_APEX_Y = 234;

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function setTopSand(progress) {
  const p = Math.min(1, Math.max(0, progress));
  const currentY = TOP_Y + (BOTTOM_APEX_Y - TOP_Y) * p;
  const points = [
    `${TOP_LEFT},${TOP_Y}`,
    `${TOP_RIGHT},${TOP_Y}`,
    `${NECK_RIGHT},${currentY}`,
    `${NECK_LEFT},${currentY}`
  ].join(" ");
  topSand.setAttribute("points", points);
}

function setBottomSand(progress) {
  const p = Math.min(1, Math.max(0, progress));
  const halfWidth = BOTTOM_MAX_HALF * p;
  const topY = BOTTOM_Y - (BOTTOM_Y - BOTTOM_APEX_Y) * p;
  const leftX = BOTTOM_CENTER_X - halfWidth;
  const rightX = BOTTOM_CENTER_X + halfWidth;
  const points = [
    `${leftX},${BOTTOM_Y}`,
    `${rightX},${BOTTOM_Y}`,
    `${BOTTOM_CENTER_X},${topY}`
  ].join(" ");
  bottomSand.setAttribute("points", points);
}

function setProgress(progress) {
  const p = Math.min(1, Math.max(0, progress));
  setTopSand(p);
  setBottomSand(p);
  sandStream.setAttribute("opacity", p >= 1 ? "0" : "1");
}

function stopTimer(finished = false) {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  sandStream.setAttribute("opacity", "0");

  if (finished) {
    setProgress(1);
    countdown.textContent = "00:00";
  }
}

function startTimer(minutes, button) {
  stopTimer(false);

  totalMs = minutes * 60 * 1000;
  endTime = Date.now() + totalMs;

  buttons.forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");

  selectedLabel.textContent = `${minutes}분`;
  countdown.textContent = formatTime(totalMs);
  setProgress(0);
  sandStream.setAttribute("opacity", "1");

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
  button.addEventListener("click", () => {
    const minutes = Number(button.dataset.minutes);
    startTimer(minutes, button);
  });
});

setProgress(0);
countdown.textContent = "00:00";
