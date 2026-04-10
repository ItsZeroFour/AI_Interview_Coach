import styles from './SkillTag.module.scss'

interface SkillTagProps {
  skills: string[]
}

export default function SkillTag({ skills }: SkillTagProps) {
  if (!skills.length) return null

  return (
    <div className={styles.container}>
      {skills.map((skill) => (
        <span key={skill} className={styles.tag}>{skill}</span>
      ))}
    </div>
  )
}
