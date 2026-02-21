let profession = localStorage.getItem("profession");
let currentLang = localStorage.getItem("lang") || "en";

let lines = [
  "Confidence is a skill.",
  "Small steps daily.",
  "Your voice matters.",
  "Practice makes powerful."
];

let i = 0;
setInterval(() => {
  let el = document.getElementById("motivationalText");
  if (el) {
    el.innerText = lines[i];
    i = (i + 1) % lines.length;
  }
}, 2500);

function selectProfession(type) {
  localStorage.setItem("profession", type);
  window.location.href = "dashboard.html";
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "hi" : "en";
  localStorage.setItem("lang", currentLang);
  location.reload();
}

async function loadDashboard() {
  if (!profession) return;

  let res = await fetch(/routine/${profession});
  let tasks = await res.json();

  let container = document.getElementById("routineContainer");
  container.innerHTML = "";

  tasks.forEach(task => {
    let div = document.createElement("div");
    div.className = "task";
    div.innerHTML = `
      <p>${task}</p>
      <button onclick="completeTask()">Done ✅</button>
    `;
    container.appendChild(div);
  });

  let streakRes = await fetch("/streak");
  let streakData = await streakRes.json();

  document.getElementById("streakCount").innerText = streakData.streak;

  let badgeContainer = document.getElementById("badgeContainer");
  badgeContainer.innerHTML = "";
  streakData.badges.forEach(badge => {
    let div = document.createElement("div");
    div.innerText = badge;
    badgeContainer.appendChild(div);
  });
}

async function completeTask() {
  let res = await fetch("/streak", { method: "POST" });
  let data = await res.json();
  document.getElementById("streakCount").innerText = data.streak;
}

async function generateAI() {
  let res = await fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profession })
  });

  let data = await res.json();
  document.getElementById("routineContainer").innerText = data.result;
}

function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = currentLang === "hi" ? "hi-IN" : "en-US";
  recognition.start();

  recognition.onresult = function(event) {
    alert("You said: " + event.results[0][0].transcript);
  };
}

async function loadAnalytics() {
  let res = await fetch("/streak");
  let data = await res.json();

  document.getElementById("analyticsStreak").innerText = data.streak;
  document.getElementById("totalTasks").innerText = data.completedTasks;
}

if (window.location.pathname.includes("dashboard")) {
  loadDashboard();
}

if (window.location.pathname.includes("analytics")) {
  loadAnalytics();
}
