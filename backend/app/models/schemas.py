from pydantic import BaseModel, Field
from enum import Enum


class InterviewType(str, Enum):
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical"
    MIXED = "mixed"


class ResumeData(BaseModel):
    raw_text: str
    skills: list[str] = []
    experience_years: int | None = None
    job_titles: list[str] = []
    education: list[str] = []


class UploadResumeResponse(BaseModel):
    session_id: str
    resume: ResumeData
    filename: str


class StartInterviewRequest(BaseModel):
    session_id: str
    job_description: str = Field(min_length=20, max_length=10000)
    interview_type: InterviewType = InterviewType.MIXED
    questions_count: int = Field(default=6, ge=3, le=10)


class ChatMessage(BaseModel):
    role: str
    content: str


class AnswerRequest(BaseModel):
    session_id: str
    answer: str = Field(min_length=1, max_length=5000)


class QuestionResponse(BaseModel):
    question: str
    question_type: str
    question_number: int
    total_questions: int
    is_last: bool = False


class AnswerEvaluation(BaseModel):
    score: int = Field(ge=1, le=5)
    strengths: list[str] = []
    improvements: list[str] = []
    comment: str = ""


class AnswerResponse(BaseModel):
    evaluation: AnswerEvaluation
    next_question: QuestionResponse | None = None
    is_finished: bool = False


class CompetencyScore(BaseModel):
    name: str
    score: int = Field(ge=1, le=5)


class InterviewReport(BaseModel):
    session_id: str
    overall_score: int = Field(ge=1, le=5)
    competencies: list[CompetencyScore] = []
    summary: str = ""
    strengths: list[str] = []
    improvements: list[str] = []
    questions_count: int = 0


class ErrorResponse(BaseModel):
    detail: str
