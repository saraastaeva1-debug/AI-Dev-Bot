const API_BASE = "http://localhost:3000";
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const previewFrame = document.getElementById("previewFrame");
const openNewTabBtn = document.getElementById("openNewTabBtn");

function addMessage(text, from = "bot") {
  const div = document.createElement("div");
  div.classList.add("msg", from);
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function generateSite() {
  const prompt = inputEl.value.trim();
  if (!prompt) return;
  addMessage(prompt, "user");
  inputEl.value = "";
  addMessage("Генерирую сайт на Gemini…", "bot");
  try {
    const res = await fetch(`${API_BASE}/api/generate-site`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data.html) {
      previewFrame.srcdoc = data.html;
      addMessage("Готово! Сайт отображается справа.", "bot");
    } else {
      addMessage("Ошибка: модель не вернула HTML.", "bot");
    }
  } catch (err) {
    addMessage("Ошибка при генерации сайта.", "bot");
  }
}

sendBtn.addEventListener("click", generateSite);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateSite();
});

openNewTabBtn.addEventListener("click", () => {
  const html = previewFrame.srcdoc || "<h1>Нет данных</h1>";
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
});
