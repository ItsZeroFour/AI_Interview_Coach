import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import Badge from '../../components/Badge/Badge'
import FileUpload from '../../components/FileUpload/FileUpload'
import TextArea from '../../components/TextArea/TextArea'
import SkillTag from '../../components/SkillTag/SkillTag'
import {
  uploadResume,
  startInterview,
  type ResumeData,
  type StartInterviewParams,
} from '../../services/api'
import styles from './Interview.module.scss'

type InterviewType = 'mixed' | 'behavioral' | 'technical'

const INTERVIEW_TYPES: { value: InterviewType; label: string; description: string }[] = [
  { value: 'mixed', label: 'Смешанное', description: 'Все типы вопросов' },
  { value: 'behavioral', label: 'Behavioral', description: 'Вопросы о вашем опыте' },
  { value: 'technical', label: 'Technical', description: 'Технические вопросы' },
]

const QUESTION_COUNTS = [4, 6, 8]

export default function Interview() {
  const navigate = useNavigate()

  const [step, setStep] = useState<'upload' | 'configure'>('upload')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sessionId, setSessionId] = useState('')
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [filename, setFilename] = useState('')

  const [jobDescription, setJobDescription] = useState('')
  const [interviewType, setInterviewType] = useState<InterviewType>('mixed')
  const [questionsCount, setQuestionsCount] = useState(6)

  async function handleFileSelect(file: File) {
    setLoading(true)
    setError(null)

    try {
      const data = await uploadResume(file)
      setSessionId(data.session_id)
      setResume(data.resume)
      setFilename(data.filename)
      setStep('configure')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  async function handleStart() {
    if (!jobDescription.trim() || jobDescription.length < 20) {
      setError('Описание вакансии должно содержать минимум 20 символов')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params: StartInterviewParams = {
        session_id: sessionId,
        job_description: jobDescription,
        interview_type: interviewType,
        questions_count: questionsCount,
      }

      const firstQuestion = await startInterview(params)

      navigate('/interview/chat', {
        state: {
          sessionId,
          firstQuestion,
          questionsCount,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запуска интервью')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setStep('upload')
    setSessionId('')
    setResume(null)
    setFilename('')
    setJobDescription('')
    setError(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Новое интервью</h1>
        <div className={styles.steps}>
          <span className={`${styles.step} ${step === 'upload' ? styles.stepActive : styles.stepDone}`}>
            1. Резюме
          </span>
          <span className={styles.stepDivider} />
          <span className={`${styles.step} ${step === 'configure' ? styles.stepActive : ''}`}>
            2. Настройка
          </span>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button className={styles.errorClose} onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {step === 'upload' && (
        <div className={styles.uploadStep}>
          <Card variant="bordered" padding="lg">
            <h2 className={styles.stepTitle}>Загрузите резюме</h2>
            <p className={styles.stepDescription}>
              AI проанализирует ваш опыт и навыки для генерации персонализированных вопросов
            </p>
            <FileUpload onFileSelect={handleFileSelect} />
            {loading && <p className={styles.loadingText}>Анализируем резюме...</p>}
          </Card>
        </div>
      )}

      {step === 'configure' && resume && (
        <div className={styles.configureStep}>
          <Card variant="bordered" padding="md">
            <div className={styles.resumeHeader}>
              <div>
                <Badge variant="success">Резюме загружено</Badge>
                <p className={styles.filename}>{filename}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Заменить
              </Button>
            </div>

            <div className={styles.resumeInfo}>
              {resume.experience_years && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Опыт</span>
                  <span className={styles.infoValue}>{resume.experience_years} лет</span>
                </div>
              )}
              {resume.job_titles.length > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Должности</span>
                  <span className={styles.infoValue}>{resume.job_titles.join(', ')}</span>
                </div>
              )}
            </div>

            {resume.skills.length > 0 && (
              <div className={styles.skillsSection}>
                <span className={styles.infoLabel}>Навыки</span>
                <SkillTag skills={resume.skills} />
              </div>
            )}
          </Card>

          <Card variant="bordered" padding="md">
            <TextArea
              label="Описание вакансии"
              placeholder="Вставьте текст описания вакансии, на которую готовитесь..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
            />
          </Card>

          <Card variant="bordered" padding="md">
            <h3 className={styles.configTitle}>Тип собеседования</h3>
            <div className={styles.typeGrid}>
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t.value}
                  className={`${styles.typeOption} ${interviewType === t.value ? styles.typeSelected : ''}`}
                  onClick={() => setInterviewType(t.value)}
                >
                  <span className={styles.typeLabel}>{t.label}</span>
                  <span className={styles.typeDesc}>{t.description}</span>
                </button>
              ))}
            </div>

            <h3 className={styles.configTitle}>Количество вопросов</h3>
            <div className={styles.countGrid}>
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  className={`${styles.countOption} ${questionsCount === count ? styles.countSelected : ''}`}
                  onClick={() => setQuestionsCount(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </Card>

          <Button
            size="lg"
            fullWidth
            onClick={handleStart}
            loading={loading}
            disabled={!jobDescription.trim()}
          >
            Начать интервью
          </Button>
        </div>
      )}
    </div>
  )
}
