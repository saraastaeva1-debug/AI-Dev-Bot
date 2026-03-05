# AI Dev Bot — Gemini Code Generator

ИИ‑бот, который генерирует сайты по описанию и показывает их в окне предпросмотра.

## Запуск

1. Установить зависимости:
```bash
npm install
```

2. Создать файл `.env` в корне проекта:
```
GEMINI_API_KEY=твой_ключ_сюда
```

3. Запустить сервер:
```bash
npm start
```

4. Открыть в браузере файл `frontend/index.html`

## Структура проекта

```
ai-dev-bot/
├── backend/
│   └── server.mjs       # Express сервер + Gemini API
├── frontend/
│   ├── index.html       # Интерфейс чата
│   ├── style.css        # Стили (тёмная тема)
│   └── script.js        # Логика фронтенда
├── package.json
└── .env                 # (создать вручную, не заливать на GitHub!)
```

## Получить Gemini API ключ

Бесплатно на [Google AI Studio](https://aistudio.google.com/app/apikey)
