import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!API_KEY) {
  console.error("Нет GEMINI_API_KEY в .env");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

async function getUnsplashImage(prompt) {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(prompt)}&per_page=1&client_id=${UNSPLASH_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    return null;
  } catch (err) {
    console.error("Ошибка Unsplash:", err);
    return null;
  }
}

app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;
  const imageUrl = await getUnsplashImage(prompt);
  if (imageUrl) {
    res.json({ image: imageUrl });
  } else {
    res.status(500).json({ error: "Картинка не найдена" });
  }
});

app.post("/api/generate-site", async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Ты — ИИ-разработчик. Сгенерируй ПОЛНЫЙ HTML-документ с CSS и JS внутри. Только HTML код без лишнего текста. Тёмная тема, фиолетовые акценты. Там где нужны картинки используй тег <img> с классом "ai-image" и data-prompt атрибутом описывающим что должно быть на картинке на английском. Описание сайта: ${prompt}`
    });
    const html = result.text;
    if (!html) throw new Error("Пустой ответ");
    res.json({ html });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка генерации сайта" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});