# InterviewAI - AI-тренажёр собеседований

Платформа для подготовки к собеседованиям с адаптивным AI-агентом. Пользователь загружает резюме и описание вакансии, после чего ИИ проводит персонализированное mock-интервью, оценивает ответы и даёт развёрнутую обратную связь с визуальной аналитикой.

## Project Brief

| Поле | Описание |
|------|----------|
| **Название проекта** | InterviewAI - AI-тренажёр собеседований |
| **Проблема** | Кандидаты не могут качественно подготовиться к собеседованиям: нет персонализированной обратной связи, вопросы из интернета не учитывают конкретную вакансию и опыт, а тренировка с живым человеком стоит дорого. |
| **Целевая аудитория** | Соискатели (junior-middle), готовящиеся к собеседованиям в IT. |
| **Пользовательский сценарий** | 1) Загружает резюме (PDF/DOCX) -> 2) Вводит описание вакансии -> 3) Проходит mock-интервью в чате (4-8 вопросов) -> 4) Получает отчёт с радар-чартом компетенций |
| **AI-задача** | Генерация контекстных вопросов, адаптация сложности, chain-of-thought оценка ответов, генерация структурированного отчёта |
| **Тип AI-адаптации** | AI-агент + продвинутый prompt engineering (routing, few-shot, self-reflection) |
| **Baseline** | Единичный вызов LLM без контекста резюме/вакансии |
| **Целевые метрики** | Win-rate >= 70%, Relevance >= 4/5, Format compliance >= 90% |

## Состав команды

| Участник | Роль | Зона ответственности |
|----------|------|----------------------|
| Участник 1 | AI-инженер / Аналитик | Промпт-пайплайн, агент, baseline, метрики |
| Участник 2 | Backend-разработчик | FastAPI, парсинг резюме, интеграция AI, деплой |
| Участник 3 | Frontend-разработчик | React-интерфейс, чат, аналитика, адаптивная вёрстка |

## Стек технологий

- **Frontend:** React 19 + TypeScript + SCSS Modules, Vite, Recharts
- **Backend:** Python 3.13 + FastAPI, SQLite (сессии in-memory)
- **AI:** Groq API (Llama 3.3 70B) с prompt engineering пайплайном
- **Деплой:** Docker Compose, Nginx

## Функционал

- Загрузка резюме (PDF/DOCX) с автоматическим извлечением навыков, опыта, образования
- Выбор типа собеседования (Behavioral / Technical / Mixed) и количества вопросов
- Адаптивное mock-интервью в чате с AI-агентом
- Оценка каждого ответа с баллами, сильными сторонами и рекомендациями
- Итоговый отчёт с радар-чартом компетенций и прогресс-барами
- История пройденных интервью

## AI-адаптация

Проект использует продвинутый prompt engineering pipeline, а не простой вызов API:

- **Question Router** - маршрутизация по типам вопросов (behavioral -> technical -> situational)
- **Few-shot примеры** - в промпт встроены образцы хороших и плохих вопросов
- **Self-reflection** - если сгенерированный вопрос слишком общий, агент автоматически переформулирует его
- **Chain-of-thought evaluation** - ответ кандидата оценивается по 5 шагам анализа
- **Раздельные системные промпты** - генерация (интервьюер) и оценка (эксперт) используют разные роли

## Структура репозитория

```
├── README.md
├── docker-compose.yml
├── docs/                        # артефакты курса
│   ├── analogs.md
│   ├── moscow-mvp.md
│   ├── roadmap.md
│   ├── cost-estimation.md
│   ├── ai-evaluation.md
│   └── security-checklist.md
├── data/
│   └── test_cases/
├── notebooks/
├── src/
│   ├── frontend/                # React + TypeScript + SCSS
│   │   ├── src/
│   │   │   ├── components/      # Button, Card, Badge, Layout, FileUpload, TextArea, SkillTag
│   │   │   ├── pages/           # Home, Interview, Chat, Report, History
│   │   │   ├── services/        # API-клиент
│   │   │   └── styles/          # SCSS-переменные и глобальные стили
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── backend/                 # FastAPI
│       ├── app/
│       │   ├── api/             # upload, interview эндпоинты
│       │   ├── core/            # конфигурация
│       │   ├── models/          # Pydantic-схемы
│       │   └── services/
│       │       ├── ai/          # groq_client, prompts, agent
│       │       ├── resume_parser.py
│       │       └── session_manager.py
│       └── Dockerfile
```

## Запуск проекта

### Требования

- Node.js 18+
- Python 3.11+
- Groq API ключ ([получить здесь](https://console.groq.com/keys))

### Backend

```bash
cd src/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Вписать GROQ_API_KEY в .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd src/frontend
npm install
npm run dev
```

Приложение: `http://localhost:5173`
API Swagger: `http://localhost:8000/docs`

### Docker (продакшн)

```bash
# Создать .env в src/backend/
docker compose up --build
```

Приложение: `http://localhost`

## Ссылки на документацию

- [Анализ аналогов](docs/analogs.md)
- [MoSCoW + MVP](docs/moscow-mvp.md)
- [Roadmap](docs/roadmap.md)
- [Расчёт стоимости](docs/cost-estimation.md)
- [Оценка качества AI](docs/ai-evaluation.md)
- [Чек-лист безопасности](docs/security-checklist.md)
