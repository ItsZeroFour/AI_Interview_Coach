import type { ReactNode, HTMLAttributes } from 'react'
import styles from './Card.module.scss'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'bordered' | 'glow'
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`pad-${padding}`],
    hoverable ? styles.hoverable : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  )
}
