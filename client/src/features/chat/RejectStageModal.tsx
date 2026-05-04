import { useState } from 'react'
import Modal from '../../components/Modal'

interface RejectStageModalProps {
  isOpen: boolean
  onClose: () => void
  onReject: (reason: string) => void
  loading: boolean
}

export default function RejectStageModal({
  isOpen,
  onClose,
  onReject,
  loading,
}: RejectStageModalProps) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return
    onReject(reason.trim())
    setReason('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Відхилити етап">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Причина відхилення
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Вкажіть причину відхилення..."
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-ink placeholder-ink-soft focus:outline-none focus:border-primary focus:bg-surface transition-colors resize-none"
          />
          <p className="text-xs text-ink-soft mt-1 text-right">
            {reason.length}/500
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
            disabled={loading || !reason.trim()}
            className="flex-1 py-2.5 bg-error text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Відхилення...' : 'Відхилити'}
          </button>
        </div>
      </form>
    </Modal>
  )
}