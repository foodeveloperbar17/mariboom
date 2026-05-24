/**
 * Hami Boom Birthday Site
 *
 * PLACEHOLDERS — replace when ready:
 * - assets/mari_boom.mp3        → plays once when Start is pressed
 * - assets/hamibg.jpeg         → shown for 1s before animation2.mp4
 * - assets/animation3.mp4      → third animation (plays before cake)
 * - LETTER_TEXT below          → your letter to Mari
 */

const LETTER_TEXT = `Your letter will appear here.

Replace this text in js/main.js by editing the LETTER_TEXT constant.`;

const SCENES = {
  landing: document.getElementById("scene-landing"),
  animation: document.getElementById("scene-animation"),
  hamibg: document.getElementById("scene-hamibg"),
  video2: document.getElementById("scene-video-2"),
  video3: document.getElementById("scene-video-3"),
  blackout: document.getElementById("scene-blackout"),
  cake: document.getElementById("scene-cake"),
};

const startBtn = document.getElementById("start-btn");
const hamiRunner = document.getElementById("hami-runner");
const explosion = document.getElementById("explosion");
const animationStage = document.querySelector(".animation-stage");
const animationVideo2 = document.getElementById("animation-video-2");
const animationVideo3 = document.getElementById("animation-video-3");
const explosionAudio = document.getElementById("explosion-audio");
const mariBoomSong = document.getElementById("mari-boom-song");
const secretLetterBtn = document.getElementById("secret-letter-btn");
const letterOverlay = document.getElementById("letter-overlay");
const letterBody = document.getElementById("letter-body");
const letterCloseBtn = document.getElementById("letter-close-btn");

let started = false;

function showScene(name) {
  Object.entries(SCENES).forEach(([key, el]) => {
    el.classList.toggle("scene-active", key === name);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setHamiPosition(left, bottom, transition = "none") {
  hamiRunner.style.transition = transition;
  hamiRunner.style.left = `${left}px`;
  hamiRunner.style.bottom = `${bottom}px`;
}

function getStageMetrics() {
  const stage = animationStage.getBoundingClientRect();
  const platformA = document.querySelector(".platform-a").getBoundingClientRect();
  const platformB = document.querySelector(".platform-b").getBoundingClientRect();
  return { stage, platformA, platformB };
}

function platformTop(platformRect, stageRect) {
  return stageRect.height - (platformRect.top - stageRect.top);
}

async function playAudio(audioEl) {
  try {
    audioEl.currentTime = 0;
    await audioEl.play();
  } catch {
    // File missing or autoplay blocked — silent fail until assets are added
  }
}

async function playVideo(videoEl) {
  return new Promise((resolve) => {
    const finish = () => {
      videoEl.removeEventListener("ended", finish);
      videoEl.removeEventListener("error", finish);
      videoEl.pause();
      resolve();
    };

    videoEl.currentTime = 0;
    videoEl.addEventListener("ended", finish);
    videoEl.addEventListener("error", finish);

    videoEl.play().catch(finish);
  });
}

async function playVideoScene(sceneName, videoEl) {
  showScene(sceneName);
  await wait(100);
  await playVideo(videoEl);
}

async function runSvgAnimation() {
  showScene("animation");
  await wait(100);

  const { stage, platformA, platformB } = getStageMetrics();
  const groundY = platformTop(platformA, stage) + 18;
  const platformBY = platformTop(platformB, stage) + 18;

  const startX = -140;
  const runEndX = platformA.left - stage.left + platformA.width * 0.55;
  const jump1X = platformB.left - stage.left + platformB.width * 0.4;
  const fallX = stage.width * 0.62;
  const explodeX = fallX;

  hamiRunner.style.opacity = "1";
  hamiRunner.classList.remove("running", "jumping", "falling");
  explosion.classList.remove("active");
  animationStage.classList.remove("shake");

  setHamiPosition(startX, groundY);
  hamiRunner.classList.add("running");

  setHamiPosition(runEndX, groundY, "left 1.8s linear");
  await wait(1800);

  hamiRunner.classList.remove("running");
  hamiRunner.classList.add("jumping");
  setHamiPosition(jump1X, platformBY, "left 0.55s ease-out, bottom 0.55s cubic-bezier(0.25, 0.8, 0.4, 1)");
  await wait(600);
  hamiRunner.classList.remove("jumping");

  hamiRunner.classList.add("running");
  const runOnB = jump1X + 60;
  setHamiPosition(runOnB, platformBY, "left 0.7s linear");
  await wait(700);

  hamiRunner.classList.remove("running");
  hamiRunner.classList.add("jumping");
  const midAirX = runOnB + 80;
  const midAirY = platformBY + 80;
  setHamiPosition(midAirX, midAirY, "left 0.4s ease-out, bottom 0.4s ease-out");
  await wait(400);

  hamiRunner.classList.remove("jumping");
  hamiRunner.classList.add("falling");
  setHamiPosition(fallX, groundY - 20, "left 0.35s linear, bottom 0.35s ease-in");
  await wait(350);

  hamiRunner.style.opacity = "0";
  explosion.style.left = `${explodeX + 55}px`;
  explosion.style.bottom = `${groundY - 40}px`;
  explosion.style.transform = "translate(-50%, 50%)";
  explosion.classList.add("active");
  animationStage.classList.add("shake");

  playAudio(explosionAudio);
  await wait(900);
}

async function showHamiBg(durationMs = 1000) {
  showScene("hamibg");
  await wait(durationMs);
}

async function runAnimationSequence() {
  await runSvgAnimation();
  await showHamiBg();
  await playVideoScene("video2", animationVideo2);
  await playVideoScene("video3", animationVideo3);

  showScene("blackout");
  await wait(800);

  showScene("cake");
}

function initLetter() {
  letterBody.textContent = LETTER_TEXT;

  secretLetterBtn.addEventListener("click", () => {
    letterOverlay.hidden = false;
  });

  letterCloseBtn.addEventListener("click", () => {
    letterOverlay.hidden = true;
  });

  letterOverlay.addEventListener("click", (e) => {
    if (e.target === letterOverlay) {
      letterOverlay.hidden = true;
    }
  });
}

startBtn.addEventListener("click", () => {
  if (started) return;
  started = true;
  startBtn.disabled = true;
  mariBoomSong.loop = false;
  playAudio(mariBoomSong);
  runAnimationSequence();
});

initLetter();
