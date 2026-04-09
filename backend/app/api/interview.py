from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    StartInterviewRequest,
    AnswerRequest,
    AnswerResponse,
    QuestionResponse,
    InterviewReport,
    ChatMessage,
)
from app.services.session_manager import sessions
from app.services.ai.agent import generate_question, evaluate_answer, generate_report
from app.services.ai.prompts import get_question_type

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

    try:
        question_text = await generate_question(session)
    except Exception:
        raise HTTPException(502, "Ошибка генерации вопроса. Проверьте API-ключ Gemini.")

    q_type = get_question_type(session.interview_type.value, 1)
    session.chat_history.append(ChatMessage(role="assistant", content=question_text))

    return QuestionResponse(
        question=question_text,
        question_type=q_type,
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

    session.chat_history.append(ChatMessage(role="user", content=req.answer))

    last_question = ""
    for msg in reversed(session.chat_history):
        if msg.role == "assistant":
            last_question = msg.content
            break

    try:
        evaluation = await evaluate_answer(
            question=last_question,
            answer=req.answer,
            job_description=session.job_description,
        )
    except Exception:
        from app.models.schemas import AnswerEvaluation
        evaluation = AnswerEvaluation(
            score=3,
            strengths=["Ответ получен"],
            improvements=["Не удалось оценить — ошибка AI"],
            comment="Оценка по умолчанию",
        )

    session.current_question += 1
    is_finished = session.current_question > session.questions_count

    next_question = None
    if not is_finished:
        try:
            question_text = await generate_question(session)
            q_type = get_question_type(
                session.interview_type.value,
                session.current_question,
            )
            session.chat_history.append(ChatMessage(role="assistant", content=question_text))

            next_question = QuestionResponse(
                question=question_text,
                question_type=q_type,
                question_number=session.current_question,
                total_questions=session.questions_count,
            )
        except Exception:
            is_finished = True
    
    if is_finished:
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

    try:
        report = await generate_report(session)
    except Exception:
        raise HTTPException(502, "Ошибка генерации отчёта")

    return report


@router.get("/sessions")
async def list_sessions():
    all_sessions = sessions.list_sessions()
    return [
        {
            "session_id": s.session_id,
            "filename": s.filename,
            "is_active": s.is_active,
            "is_finished": s.is_finished,
            "questions_answered": len([m for m in s.chat_history if m.role == "user"]),
        }
        for s in all_sessions
    ]
