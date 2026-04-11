import json
import logging

from app.models.schemas import (
    AnswerEvaluation,
    InterviewReport,
    CompetencyScore,
    ChatMessage,
)
from app.services.ai.groq_client import generate, generate_json
from app.services.ai.prompts import (
    SYSTEM_INTERVIEWER,
    SYSTEM_EVALUATOR,
    BASELINE_QUESTION,
    build_question_prompt,
    build_evaluation_prompt,
    build_report_prompt,
    build_self_reflection_prompt,
    get_question_type,
)
from app.services.session_manager import InterviewSession

logger = logging.getLogger(__name__)


def _format_chat_history(history: list[ChatMessage]) -> str:
    if not history:
        return ""
    lines = []
    for msg in history[-6:]:
        role = "Интервьюер" if msg.role == "assistant" else "Кандидат"
        lines.append(f"{role}: {msg.content}")
    return "\n".join(lines)


def _safe_parse_json(text: str) -> dict:
    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}") + 1
    if start != -1 and end > start:
        cleaned = cleaned[start:end]

    return json.loads(cleaned)


def _is_question_quality_low(question: str) -> bool:
    if len(question) < 30:
        return True

    weak_phrases = [
        "расскажите о себе",
        "какие у вас сильные стороны",
        "какие у вас слабые стороны",
        "почему вы хотите",
    ]
    question_lower = question.lower()
    return any(phrase in question_lower for phrase in weak_phrases)


async def generate_baseline_question() -> str:
    return await generate(BASELINE_QUESTION, SYSTEM_INTERVIEWER)


async def generate_question(session: InterviewSession) -> str:
    q_type = get_question_type(
        session.interview_type.value,
        session.current_question,
    )

    history_text = _format_chat_history(session.chat_history)

    prompt = build_question_prompt(
        resume_text=session.resume.raw_text,
        job_description=session.job_description,
        question_type=q_type,
        question_number=session.current_question,
        total_questions=session.questions_count,
        chat_history=history_text,
    )

    question = await generate(prompt, SYSTEM_INTERVIEWER, temperature=0.75)
    question = question.strip().strip('"').strip("«»")

    if _is_question_quality_low(question):
        logger.info("Низкое качество вопроса, запускаю self-reflection")
        try:
            reflection_prompt = build_self_reflection_prompt(question)
            improved = await generate(reflection_prompt, SYSTEM_INTERVIEWER, temperature=0.6)
            improved = improved.strip().strip('"').strip("«»")
            if improved and len(improved) > 20:
                question = improved
        except Exception as e:
            logger.warning(f"Self-reflection не сработал: {e}")

    return question


async def evaluate_answer(
    question: str,
    answer: str,
    job_description: str,
) -> AnswerEvaluation:
    prompt = build_evaluation_prompt(question, answer, job_description)

    try:
        raw = await generate_json(prompt, SYSTEM_EVALUATOR, temperature=0.3)
        data = _safe_parse_json(raw)

        return AnswerEvaluation(
            score=max(1, min(5, int(data.get("score", 3)))),
            strengths=[s for s in data.get("strengths", [])[:3] if s],
            improvements=[s for s in data.get("improvements", [])[:3] if s],
            comment=data.get("comment", ""),
        )
    except Exception as e:
        logger.warning(f"Ошибка парсинга оценки: {e}")
        return AnswerEvaluation(
            score=3,
            strengths=["Ответ получен"],
            improvements=["Не удалось выполнить детальную оценку"],
            comment="Оценка по умолчанию",
        )


def _build_qa_pairs(messages: list[ChatMessage]) -> list[dict]:
    pairs = []
    for i in range(0, len(messages) - 1, 2):
        if messages[i].role == "assistant" and i + 1 < len(messages):
            pairs.append({
                "question": messages[i].content,
                "answer": messages[i + 1].content,
            })
    return pairs


async def generate_report(session: InterviewSession) -> InterviewReport:
    qa_pairs = _build_qa_pairs(session.chat_history)

    prompt = build_report_prompt(
        resume_text=session.resume.raw_text,
        job_description=session.job_description,
        qa_pairs=qa_pairs,
    )

    try:
        raw = await generate_json(prompt, SYSTEM_EVALUATOR, temperature=0.3)
        data = _safe_parse_json(raw)

        competencies = [
            CompetencyScore(
                name=c.get("name", "—"),
                score=max(1, min(5, int(c.get("score", 3)))),
            )
            for c in data.get("competencies", [])
        ]

        return InterviewReport(
            session_id=session.session_id,
            overall_score=max(1, min(5, int(data.get("overall_score", 3)))),
            competencies=competencies,
            summary=data.get("summary", ""),
            strengths=[s for s in data.get("strengths", [])[:5] if s],
            improvements=[s for s in data.get("improvements", [])[:5] if s],
            questions_count=len(qa_pairs),
        )
    except Exception as e:
        logger.warning(f"Ошибка генерации отчёта: {e}")
        return InterviewReport(
            session_id=session.session_id,
            overall_score=3,
            summary="Не удалось сгенерировать детальный отчёт.",
            questions_count=len(qa_pairs),
        )
