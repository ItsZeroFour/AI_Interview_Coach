import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import Badge from '../../components/Badge/Badge'
import styles from './Home.module.scss'

const FEATURES = [
  {
    title: 'Анализ резюме',
    description: 'Загрузите PDF или DOCX — AI извлечёт навыки, опыт и ключевые компетенции',
    icon: '📄',
  },
  {
    title: 'Адаптивные вопросы',
    description: 'Агент подбирает тип и сложность вопросов на основе вашего профиля и вакансии',
    icon: '🎯',
  },
  {
    title: 'Оценка ответов',
    description: 'Каждый ответ анализируется по структуре, релевантности и глубине',
    icon: '📊',
  },
  {
    title: 'Детальный фидбек',
    description: 'Получите отчёт с радар-чартом компетенций и конкретными рекомендациями',
    icon: '✨',
  },
]

const INTERVIEW_TYPES = [
  { label: 'Behavioral', description: 'Вопросы о вашем опыте и поведении' },
  { label: 'Technical', description: 'Проверка технических знаний' },
  { label: 'Situational', description: 'Гипотетические рабочие ситуации' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Badge variant="accent">AI-powered</Badge>
          <h1 className={styles.title}>
            Подготовьтесь к собеседованию
            <span className={styles.titleAccent}> с AI-тренером</span>
          </h1>
          <p className={styles.subtitle}>
            Загрузите резюме, укажите вакансию — и пройдите персонализированное
            mock-интервью с мгновенной обратной связью
          </p>
          <div className={styles.heroActions}>
            <Button size="lg" onClick={() => navigate('/interview')}>
              Начать интервью
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/history')}>
              История сессий
            </Button>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.mockChat}>
            <div className={styles.chatBubble}>
              <span className={styles.chatRole}>AI</span>
              <p>Расскажите о проекте, которым вы гордитесь больше всего. Какую роль вы играли и каких результатов достигли?</p>
            </div>
            <div className={`${styles.chatBubble} ${styles.chatUser}`}>
              <span className={styles.chatRole}>Вы</span>
              <p>На прошлом месте я руководил миграцией монолита на микросервисы...</p>
            </div>
            <div className={styles.chatBubble}>
              <span className={styles.chatRole}>AI</span>
              <p>Хороший пример! Давайте углубимся — с какими техническими сложностями вы столкнулись?</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Как это работает</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <Card key={feature.title} variant="bordered" hoverable>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className={styles.types}>
        <h2 className={styles.sectionTitle}>Типы вопросов</h2>
        <div className={styles.typesList}>
          {INTERVIEW_TYPES.map((type, i) => (
            <div key={type.label} className={styles.typeItem}>
              <span className={styles.typeNumber}>0{i + 1}</span>
              <div>
                <h3 className={styles.typeLabel}>{type.label}</h3>
                <p className={styles.typeDescription}>{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
