import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Badge from '../../components/Badge/Badge'
import {
  submitAnswer,
  type QuestionData,
  type EvaluationData,
} from '../../services/api'
import styles from './Chat.module.scss'

interface ChatMessage {
  id: string
  role: 'ai' | 'user'
  content: string
  questionType?: string
  evaluation?: EvaluationData
}

interface LocationState {
  sessionId: string
  firstQuestion: QuestionData
  questionsCount: number
}

function ScoreDots({ score }: { score: number }) {
  return (
    <div className={styles.scoreDots}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`${styles.dot} ${n <= score ? styles.dotFilled : ''}`}
        />
      ))}
      <span className={styles.scoreText}>{score}/5</span>
    </div>
  )
}

export default function Chat() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(6)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!state) {
      navigate('/interview')
      return
    }

    setTotalQuestions(state.questionsCount)
    setMessages([{
      id: 'q-1',
      role: 'ai',
      content: state.firstQuestion.question,
      questionType: state.firstQuestion.question_type,
    }])
  }, [state, navigate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!loading && !isFinished) {
      inputRef.current?.focus()
    }
  }, [loading, isFinished])

  async function handleSubmit() {
    if (!input.trim() || loading || !state) return

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await submitAnswer(state.sessionId, userMessage.content)

      const evaluationMessage: ChatMessage = {
        id: `eval-${Date.now()}`,
        role: 'ai',
        content: '',
        evaluation: response.evaluation,
      }
      setMessages(prev => [...prev, evaluationMessage])

      if (response.is_finished) {
        setIsFinished(true)
      } else if (response.next_question) {
        const nextQ = response.next_question
        setCurrentQuestion(nextQ.question_number)

        const questionMessage: ChatMessage = {
          id: `q-${nextQ.question_number}`,
          role: 'ai',
          content: nextQ.question,
          questionType: nextQ.question_type,
        }
        setMessages(prev => [...prev, questionMessage])
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'ai',
        content: 'Произошла ошибка при обработке ответа. Попробуйте ещё раз.',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function typeLabel(type: string) {
    const labels: Record<string, string> = {
      behavioral: 'Behavioral',
      technical: 'Technical',
      situational: 'Situational',
    }
    return labels[type] || type
  }

  if (!state) return null

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h2 className={styles.topTitle}>Интервью</h2>
          <span className={styles.topProgress}>
            {currentQuestion} / {totalQuestions}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.chatArea}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
            {msg.role === 'ai' && msg.evaluation ? (
              <div className={styles.evalCard}>
                <div className={styles.evalHeader}>
                  <span className={styles.evalLabel}>Оценка ответа</span>
                  <ScoreDots score={msg.evaluation.score} />
                </div>

                {msg.evaluation.strengths.length > 0 && (
                  <div className={styles.evalSection}>
                    <span className={styles.evalSectionTitle}>Сильные стороны</span>
                    {msg.evaluation.strengths.map((s, i) => (
                      <p key={i} className={styles.evalItem}>
                        <span className={styles.evalPlus}>+</span> {s}
                      </p>
                    ))}
                  </div>
                )}

                {msg.evaluation.improvements.length > 0 && (
                  <div className={styles.evalSection}>
                    <span className={styles.evalSectionTitle}>Что улучшить</span>
                    {msg.evaluation.improvements.map((s, i) => (
                      <p key={i} className={styles.evalItem}>
                        <span className={styles.evalMinus}>→</span> {s}
                      </p>
                    ))}
                  </div>
                )}

                {msg.evaluation.comment && (
                  <p className={styles.evalComment}>{msg.evaluation.comment}</p>
                )}
              </div>
            ) : (
              <div className={styles.bubble}>
                {msg.role === 'ai' && (
                  <div className={styles.bubbleHeader}>
                    <span className={styles.bubbleRole}>AI</span>
                    {msg.questionType && (
                      <Badge variant="default">{typeLabel(msg.questionType)}</Badge>
                    )}
                  </div>
                )}
                {msg.role === 'user' && (
                  <span className={styles.bubbleRole}>Вы</span>
                )}
                <p className={styles.bubbleText}>{msg.content}</p>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className={`${styles.message} ${styles.ai}`}>
            <div className={styles.bubble}>
              <span className={styles.bubbleRole}>AI</span>
              <div className={styles.typing}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {isFinished && (
          <div className={styles.finishedCard}>
            <h3>Интервью завершено</h3>
            <p>Все вопросы пройдены. Посмотрите подробный отчёт с оценкой компетенций.</p>
            <Button onClick={() => navigate(`/report/${state.sessionId}`)}>
              Смотреть отчёт
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!isFinished && (
        <div className={styles.inputArea}>
          <textarea
            ref={inputRef}
            className={styles.input}
            placeholder="Введите ваш ответ..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            disabled={loading}
          />
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!input.trim()}
          >
            Отправить
          </Button>
        </div>
      )}
    </div>
  )
}
