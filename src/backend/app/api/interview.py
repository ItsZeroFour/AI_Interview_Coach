from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    StartInterviewRequest,
    AnswerRequest,
    AnswerResponse,
    QuestionResponse,
    InterviewReport,
)
from app.services.session_manager import sessions

router = APIRouter(prefix="/api/interview", tags=["interview"])


@router.post("/start", response_model=QuestionResponse)
async def start_interview(req: StartInterviewRequest):
    session = sessions.get_session(req.session_id)
    if not session:
        raise HTTPException(404, "Сессия не найдена. Сначала загрузите резюме.")

    if session.is_active:
        raise HTTPException(400, "Интервью уже запущено")

    session.job_description = req.job_description
    session.interview_type = req.interview_type
    session.questions_count = req.questions_count
    session.current_question = 1
    session.is_active = True

    # в коммите #4 (AI baseline) здесь будет вызов Gemini
    # пока возвращаем заглушку
    question_text = (
        "Расскажите о себе и о том, почему вас заинтересовала эта позиция. "
        "Какой ваш опыт наиболее релевантен?"
    )

    return QuestionResponse(
        question=question_text,
        question_type="behavioral",
        question_number=1,
        total_questions=session.questions_count,
    )


@router.post("/answer", response_model=AnswerResponse)
async def submit_answer(req: AnswerRequest):
    session = sessions.get_session(req.session_id)
    if not session:
        raise HTTPException(404, "Сессия не найдена")

    if not session.is_active:
        raise HTTPException(400, "Интервью не запущено")

    if session.is_finished:
        raise HTTPException(400, "Интервью уже завершено")

    # в коммите #6 (AI Agent) здесь будет оценка через Gemini
    from app.models.schemas import AnswerEvaluation, ChatMessage

    session.chat_history.append(ChatMessage(role="user", content=req.answer))

    evaluation = AnswerEvaluation(
        score=3,
        strengths=["Ответ получен"],
        improvements=["AI-оценка будет в коммите #6"],
        comment="Заглушка — AI ещё не подключен",
    )

    session.current_question += 1
    is_finished = session.current_question > session.questions_count

    next_question = None
    if not is_finished:
        next_question = QuestionResponse(
            question="Следующий вопрос будет сгенерирован AI-агентом (коммит #6)",
            question_type="technical",
            question_number=session.current_question,
            total_questions=session.questions_count,
        )
    else:
        session.is_finished = True
        session.is_active = False

    return AnswerResponse(
        evaluation=evaluation,
        next_question=next_question,
        is_finished=is_finished,
    )


@router.get("/report/{session_id}", response_model=InterviewReport)
async def get_report(session_id: str):
    session = sessions.get_session(session_id)
    if not session:
        raise HTTPException(404, "Сессия не найдена")

    if not session.is_finished:
        raise HTTPException(400, "Интервью ещё не завершено")

    # в коммите #8 здесь будет генерация отчёта через AI
    from app.models.schemas import CompetencyScore

    return InterviewReport(
        session_id=session_id,
        overall_score=3,
        competencies=[
            CompetencyScore(name="Коммуникация", score=3),
            CompetencyScore(name="Технические навыки", score=3),
            CompetencyScore(name="Решение проблем", score=3),
            CompetencyScore(name="Лидерство", score=3),
            CompetencyScore(name="Адаптивность", score=3),
        ],
        summary="Отчёт-заглушка. AI-генерация будет в коммите #8.",
        strengths=["Заглушка"],
        improvements=["Подключить AI для оценки"],
        questions_count=len(session.chat_history),
    )


@router.get("/sessions")
async def list_sessions():
    all_sessions = sessions.list_sessions()
    return [
        {
            "session_id": s.session_id,
            "filename": s.filename,
            "is_active": s.is_active,
            "is_finished": s.is_finished,
            "questions_answered": len(s.chat_history),
        }
        for s in all_sessions
    ]
