import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Нет GEMINI_API_KEY в .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

app.post("/api/generate-site", async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const fullPrompt = `
Ты — ИИ-разработчик. Сгенерируй ПОЛНЫЙ HTML-документ с CSS и JS.
Тёмная тема, фиолетовые акценты.
Описание сайта: ${prompt}
`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const html = response.text();
    res.json({ html });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка генерации сайта" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
