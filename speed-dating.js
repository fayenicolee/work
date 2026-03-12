const questions = [
  "What is your all-time favourite book?",
  "What is your least favourite book you've ever finished?",
  "Which book character do you love the most?",
  "Which book character annoys you the most?",
  "What is your favourite book genre?",
  "What genre do you usually avoid?",
  "What book made you laugh the most?",
  "What book made you cry or feel really emotional?",
  "What is the most exciting book you've read?",
  "What is the most boring book you've ever had to read?",
  "Which fictional world would you most like to visit?",
  "Which fictional world would you never want to live in?",
  "Who is your favourite villain from a book?",
  "Which hero or heroine do you admire most?",
  "What book do you think is overrated?",
  "What book do you think is underrated?",
  "Which book would you recommend to almost anyone?",
  "Which book were you surprised to enjoy?",
  "Which book disappointed you the most?",
  "If you could swap places with one book character for a day, who would it be?",
  "What is the best book you've read in school?",
  "What is the worst book you've read in school?",
  "Which author would you most like to meet?",
  "Which book has the best plot twist?",
  "Which book has the saddest ending?",
  "Which book has the happiest ending?",
  "What book do you wish had a sequel?",
  "What book do you think would make a great film or series?",
  "What book cover has caught your attention the most?",
  "What book are you hoping to read next?"
];

const questionButton = document.getElementById("questionButton");
const questionText = document.getElementById("questionText");
const timerButton = document.getElementById("timerButton");
const timerText = document.getElementById("timerText");

let currentQuestion = "";
let lastQuestionIndex = -1;
const roundDurationMs = 2 * 60 * 1000;
let timerState = "idle";
let timerIntervalId = null;
let roundEndsAt = 0;

function pickRandomQuestion() {
  if (questions.length === 1) {
    lastQuestionIndex = 0;
    return questions[0];
  }

  let nextIndex = lastQuestionIndex;
  while (nextIndex === lastQuestionIndex) {
    nextIndex = Math.floor(Math.random() * questions.length);
  }

  lastQuestionIndex = nextIndex;
  return questions[nextIndex];
}

function revealQuestion() {
  currentQuestion = pickRandomQuestion();
  questionText.textContent = currentQuestion;
}

function formatTime(msRemaining) {
  const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderTimerIdle() {
  timerState = "idle";
  timerButton.classList.remove("is-running", "is-finished");
  timerButton.querySelector(".timer-label").textContent = "Tap to start round";
  timerText.textContent = "02:00";
}

function finishTimer() {
  window.clearInterval(timerIntervalId);
  timerIntervalId = null;
  timerState = "finished";
  timerButton.classList.remove("is-running");
  timerButton.classList.add("is-finished");
  timerButton.querySelector(".timer-label").textContent = "Tap to reset";
  timerText.textContent = "Time's Up! Move to the next table.";
}

function tickTimer() {
  const msRemaining = roundEndsAt - Date.now();
  if (msRemaining <= 0) {
    finishTimer();
    return;
  }

  timerText.textContent = formatTime(msRemaining);
}

function startTimer() {
  window.clearInterval(timerIntervalId);
  roundEndsAt = Date.now() + roundDurationMs;
  timerState = "running";
  timerButton.classList.remove("is-finished");
  timerButton.classList.add("is-running");
  timerButton.querySelector(".timer-label").textContent = "Round in progress";
  tickTimer();
  timerIntervalId = window.setInterval(tickTimer, 250);
}

function handleTimerClick() {
  if (timerState === "running") {
    return;
  }

  if (timerState === "finished") {
    renderTimerIdle();
    return;
  }

  startTimer();
}

questionButton.addEventListener("click", revealQuestion);
timerButton.addEventListener("click", handleTimerClick);
renderTimerIdle();
revealQuestion();
