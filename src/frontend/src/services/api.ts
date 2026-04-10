const API_BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Неизвестная ошибка' }))
    throw new Error(error.detail || `Ошибка ${response.status}`)
  }

  return response.json()
}

export async function uploadResume(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request<UploadResponse>('/upload', {
    method: 'POST',
    body: formData,
  })
}

export async function startInterview(params: StartInterviewParams) {
  return request<QuestionData>('/interview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
}

export async function submitAnswer(sessionId: string, answer: string) {
  return request<AnswerResponseData>('/interview/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, answer }),
  })
}

export async function getReport(sessionId: string) {
  return request<ReportData>(`/interview/report/${sessionId}`)
}

export async function getSessions() {
  return request<SessionItem[]>('/interview/sessions')
}

export interface ResumeData {
  raw_text: string
  skills: string[]
  experience_years: number | null
  job_titles: string[]
  education: string[]
}

export interface UploadResponse {
  session_id: string
  resume: ResumeData
  filename: string
}

export interface StartInterviewParams {
  session_id: string
  job_description: string
  interview_type: 'behavioral' | 'technical' | 'mixed'
  questions_count: number
}

export interface QuestionData {
  question: string
  question_type: string
  question_number: number
  total_questions: number
  is_last?: boolean
}

export interface EvaluationData {
  score: number
  strengths: string[]
  improvements: string[]
  comment: string
}

export interface AnswerResponseData {
  evaluation: EvaluationData
  next_question: QuestionData | null
  is_finished: boolean
}

export interface CompetencyScore {
  name: string
  score: number
}

export interface ReportData {
  session_id: string
  overall_score: number
  competencies: CompetencyScore[]
  summary: string
  strengths: string[]
  improvements: string[]
  questions_count: number
}

export interface SessionItem {
  session_id: string
  filename: string
  is_active: boolean
  is_finished: boolean
  questions_answered: number
}
