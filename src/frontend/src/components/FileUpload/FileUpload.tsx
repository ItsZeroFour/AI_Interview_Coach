import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import styles from './FileUpload.module.scss'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSizeMb?: number
}

export default function FileUpload({
  onFileSelect,
  accept = '.pdf,.docx',
  maxSizeMb = 10,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function validate(file: File): boolean {
    const maxBytes = maxSizeMb * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`Файл слишком большой (макс. ${maxSizeMb} МБ)`)
      return false
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowed = accept.split(',').map(a => a.replace('.', '').trim())
    if (ext && !allowed.includes(ext)) {
      setError(`Допустимые форматы: ${accept}`)
      return false
    }

    return true
  }

  function handleFile(file: File) {
    setError(null)
    if (!validate(file)) return
    setFileName(file.name)
    onFileSelect(file)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      className={`${styles.dropzone} ${dragOver ? styles.active : ''} ${error ? styles.hasError : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className={styles.input}
      />

      {fileName ? (
        <div className={styles.fileInfo}>
          <span className={styles.fileIcon}>📎</span>
          <span className={styles.fileName}>{fileName}</span>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.uploadIcon}>↑</span>
          <p className={styles.text}>Перетащите файл или нажмите для выбора</p>
          <p className={styles.hint}>PDF, DOCX — до {maxSizeMb} МБ</p>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
