import type { ReactNode } from 'react'
import styles from './Badge.module.scss'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error'
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {children}
    </span>
  )
}
