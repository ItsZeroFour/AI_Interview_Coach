import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import Badge from '../../components/Badge/Badge'
import { getSessions, type SessionItem } from '../../services/api'
import styles from './History.module.scss'

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>📋</div>
      <h2 className={styles.emptyTitle}>Пока нет интервью</h2>
      <p className={styles.emptyText}>
        Пройдите первое mock-интервью, и оно появится здесь
      </p>
      <Button onClick={onStart}>Начать интервью</Button>
    </div>
  )
}

function SessionCard({ session, onReport }: { session: SessionItem; onReport: (id: string) => void }) {
  function getStatus() {
    if (session.is_finished) return { label: 'Завершено', variant: 'success' as const }
    if (session.is_active) return { label: 'В процессе', variant: 'accent' as const }
    return { label: 'Не начато', variant: 'default' as const }
  }

  const status = getStatus()

  return (
    <Card variant="bordered" padding="md" hoverable>
      <div className={styles.sessionCard}>
        <div className={styles.sessionInfo}>
          <div className={styles.sessionTop}>
            <span className={styles.sessionFile}>{session.filename}</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className={styles.sessionMeta}>
            <span className={styles.metaItem}>
              Вопросов: {session.questions_answered}
            </span>
            <span className={styles.metaItem}>
              ID: {session.session_id}
            </span>
          </div>
        </div>

        {session.is_finished && (
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onReport(session.session_id)
            }}
          >
            Отчёт
          </Button>
        )}
      </div>
    </Card>
  )
}

export default function History() {
  const navigate = useNavigate()

  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await getSessions()
        setSessions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>История интервью</h1>
        <Button onClick={() => navigate('/interview')}>Новое интервью</Button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
        </div>
      )}

      {sessions.length === 0 ? (
        <EmptyState onStart={() => navigate('/interview')} />
      ) : (
        <div className={styles.sessionList}>
          {sessions.map((session) => (
            <SessionCard
              key={session.session_id}
              session={session}
              onReport={(id) => navigate(`/report/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
