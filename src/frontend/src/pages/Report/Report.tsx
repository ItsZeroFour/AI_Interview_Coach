import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import Badge from '../../components/Badge/Badge'
import { getReport, type ReportData } from '../../services/api'
import styles from './Report.module.scss'

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const percentage = (score / 5) * 100
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={styles.scoreCircle}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="#23262f"
          strokeWidth="6"
        />
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="#e2a842"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          className={styles.scoreArc}
        />
        <text x="50" y="46" textAnchor="middle" className={styles.scoreValue}>
          {score}
        </text>
        <text x="50" y="62" textAnchor="middle" className={styles.scoreMax}>
          из 5
        </text>
      </svg>
      <span className={styles.scoreLabel}>{label}</span>
    </div>
  )
}

export default function Report() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    async function fetchReport() {
      try {
        const data = await getReport(sessionId!)
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки отчёта')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [sessionId])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Генерируем отчёт...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className={styles.page}>
        <Card variant="bordered" padding="lg">
          <div className={styles.errorState}>
            <h2>Не удалось загрузить отчёт</h2>
            <p>{error || 'Отчёт не найден'}</p>
            <Button onClick={() => navigate('/interview')}>Новое интервью</Button>
          </div>
        </Card>
      </div>
    )
  }

  const radarData = report.competencies.map((c) => ({
    subject: c.name,
    score: c.score,
    fullMark: 5,
  }))

  function getScoreLabel(score: number): string {
    if (score >= 5) return 'Отлично'
    if (score >= 4) return 'Хорошо'
    if (score >= 3) return 'Средне'
    if (score >= 2) return 'Слабо'
    return 'Критично'
  }

  function getScoreVariant(score: number): 'success' | 'accent' | 'warning' | 'error' {
    if (score >= 4) return 'success'
    if (score >= 3) return 'accent'
    if (score >= 2) return 'warning'
    return 'error'
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Badge variant={getScoreVariant(report.overall_score)}>
            {getScoreLabel(report.overall_score)}
          </Badge>
          <h1 className={styles.title}>Результаты интервью</h1>
          <p className={styles.subtitle}>
            Пройдено вопросов: {report.questions_count}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/interview')}>
          Новое интервью
        </Button>
      </div>

      <div className={styles.topGrid}>
        <Card variant="bordered" padding="lg">
          <h3 className={styles.cardTitle}>Общая оценка</h3>
          <div className={styles.scoreCenter}>
            <ScoreCircle score={report.overall_score} label={getScoreLabel(report.overall_score)} />
          </div>
        </Card>

        <Card variant="bordered" padding="lg">
          <h3 className={styles.cardTitle}>Компетенции</h3>
          <div className={styles.radarWrap}>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#23262f" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#908d85', fontSize: 12, fontFamily: 'Outfit' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  tick={{ fill: '#5a584f', fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Оценка"
                  dataKey="score"
                  stroke="#e2a842"
                  fill="#e2a842"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card variant="bordered" padding="lg">
        <h3 className={styles.cardTitle}>Детали по компетенциям</h3>
        <div className={styles.competencyList}>
          {report.competencies.map((c) => (
            <div key={c.name} className={styles.competencyItem}>
              <span className={styles.competencyName}>{c.name}</span>
              <div className={styles.competencyBar}>
                <div
                  className={styles.competencyFill}
                  style={{ width: `${(c.score / 5) * 100}%` }}
                />
              </div>
              <span className={styles.competencyScore}>{c.score}/5</span>
            </div>
          ))}
        </div>
      </Card>

      {report.summary && (
        <Card variant="bordered" padding="lg">
          <h3 className={styles.cardTitle}>Резюме</h3>
          <p className={styles.summaryText}>{report.summary}</p>
        </Card>
      )}

      <div className={styles.bottomGrid}>
        {report.strengths.length > 0 && (
          <Card variant="bordered" padding="lg">
            <h3 className={styles.cardTitle}>Сильные стороны</h3>
            <div className={styles.feedbackList}>
              {report.strengths.map((s, i) => (
                <div key={i} className={styles.feedbackItem}>
                  <span className={styles.feedbackPlus}>+</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {report.improvements.length > 0 && (
          <Card variant="bordered" padding="lg">
            <h3 className={styles.cardTitle}>Зоны роста</h3>
            <div className={styles.feedbackList}>
              {report.improvements.map((s, i) => (
                <div key={i} className={styles.feedbackItem}>
                  <span className={styles.feedbackArrow}>→</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className={styles.actions}>
        <Button size="lg" onClick={() => navigate('/interview')}>
          Пройти ещё раз
        </Button>
        <Button size="lg" variant="secondary" onClick={() => navigate('/history')}>
          История
        </Button>
      </div>
    </div>
  )
}
