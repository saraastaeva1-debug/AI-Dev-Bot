const API_BASE = "";
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const previewFrame = document.getElementById("previewFrame");
const openNewTabBtn = document.getElementById("openNewTabBtn");

let currentHTML = "";
let history = JSON.parse(localStorage.getItem("siteHistory") || "[]");

function addMessage(text, from = "bot") {
  const div = document.createElement("div");
  div.classList.add("msg", from);
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function saveToHistory(prompt, html) {
  history.unshift({ prompt, html, date: new Date().toLocaleString() });
  if (history.length > 10) history.pop();
  localStorage.setItem("siteHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const historyEl = document.getElementById("history-list");
  if (!historyEl) return;
  historyEl.innerHTML = "";
  history.forEach((item, i) => {
    const div = document.createElement("div");
    div.classList.add("history-item");
    div.innerHTML = `<span>${item.date}: ${item.prompt.slice(0, 30)}...</span>
      <button onclick="loadFromHistory(${i})">Загрузить</button>`;
    historyEl.appendChild(div);
  });
}

function loadFromHistory(i) {
  currentHTML = history[i].html;
  previewFrame.srcdoc = currentHTML;
  addMessage(`Загружено: ${history[i].prompt}`, "bot");
}

async function fillImages(doc) {
  const images = doc.querySelectorAll("img.ai-image");
  for (const img of images) {
    const prompt = img.getAttribute("data-prompt");
    if (!prompt) continue;
    try {
      const res = await fetch(`${API_BASE}/api/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.image) img.src = data.image;
    } catch (err) {
      console.error("Ошибка картинки:", err);
    }
  }
}

async function generateSite() {
  const prompt = inputEl.value.trim();
  if (!prompt) return;
  addMessage(prompt, "user");
  inputEl.value = "";

  if (currentHTML) {
    addMessage("Редактирую сайт…", "bot");
    try {
      const res = await fetch(`${API_BASE}/api/edit-site`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, html: currentHTML })
      });
      const data = await res.json();
      if (data.html) {
        currentHTML = data.html.replace(/^```html\n?/, "").replace(/\n?```$/, "");
        previewFrame.srcdoc = currentHTML;
        addMessage("Готово! Генерирую картинки…", "bot");
        previewFrame.onload = async () => {
          await fillImages(previewFrame.contentDocument);
          addMessage("Картинки готовы! 🎨", "bot");
        };
        saveToHistory(prompt, currentHTML);
      }
    } catch (err) {
      addMessage("Ошибка при редактировании.", "bot");
    }
  } else {
    addMessage("Генерирую сайт на Gemini…", "bot");
    try {
      const res = await fetch(`${API_BASE}/api/generate-site`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.html) {
        currentHTML = data.html.replace(/^```html\n?/, "").replace(/\n?```$/, "");
        previewFrame.srcdoc = currentHTML;
        addMessage("Готово! Генерирую картинки…", "bot");
        previewFrame.onload = async () => {
          await fillImages(previewFrame.contentDocument);
          addMessage("Картинки готовы! 🎨", "bot");
        };
        saveToHistory(prompt, currentHTML);
      } else {
        addMessage("Ошибка: модель не вернула HTML.", "bot");
      }
    } catch (err) {
      addMessage("Ошибка при генерации сайта.", "bot");
    }
  }
}

async function downloadSite() {
  if (!currentHTML) return addMessage("Сначала создай сайт!", "bot");
  addMessage("Подготавливаю сайт для скачивания…", "bot");

  const parser = new DOMParser();
  const doc = parser.parseFromString(currentHTML, "text/html");
  const images = doc.querySelectorAll("img");

  for (const img of images) {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("data:")) continue;
    try {
      const res = await fetch("/api/proxy-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: src })
      });
      const data = await res.json();
      if (data.base64) img.src = data.base64;
    } catch (err) {
      console.error("Ошибка конвертации:", err);
    }
  }

  const finalHTML = doc.documentElement.outerHTML;
  const blob = new Blob([finalHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-site.html";
  a.click();
  addMessage("Сайт сохранён с картинками! 💾", "bot");
}

function newSite() {
  currentHTML = "";
  previewFrame.srcdoc = "";
  addMessage("Начинаем новый сайт! Опиши что хочешь.", "bot");
}

sendBtn.addEventListener("click", generateSite);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateSite();
});

openNewTabBtn.addEventListener("click", () => {
  if (!currentHTML) return;
  const blob = new Blob([currentHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
});

document.getElementById("downloadBtn").addEventListener("click", downloadSite);
document.getElementById("newSiteBtn").addEventListener("click", newSite);

renderHistory();