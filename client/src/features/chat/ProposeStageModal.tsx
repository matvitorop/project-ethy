import { useState } from 'react'
import Modal from '../../components/Modal'

interface ProposeStageModalProps {
  isOpen: boolean
  onClose: () => void
  onPropose: (content: string) => void
  loading: boolean
}

export default function ProposeStageModal({
  isOpen,
  onClose,
  onPropose,
  loading,
}: ProposeStageModalProps) {
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    onPropose(content.trim())
    setContent('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Запропонувати етап">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Опис етапу
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Опишіть що має відбутись на цьому етапі..."
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-ink placeholder-ink-soft focus:outline-none focus:border-primary focus:bg-surface transition-colors resize-none"
          />
          <p className="text-xs text-ink-soft mt-1 text-right">
            {content.length}/500
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-ink hover:border-primary transition-colors"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors"
          >
            {loading ? 'Надсилання...' : 'Запропонувати'}
          </button>
        </div>
      </form>
    </Modal>
  )
}