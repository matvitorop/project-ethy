import { useState } from 'react'
import Modal from '../../components/Modal'
import Button from '../../components/ui/Button'

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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3 ml-1">
            Причина відхилення
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Будь ласка, поясніть, чому цей етап не може бути прийнятий у поточному вигляді..."
            maxLength={500}
            rows={4}
            className="w-full px-4 py-4 bg-surface-muted border-2 border-border rounded-2xl text-sm font-medium text-ink placeholder-ink-soft focus:outline-none focus:border-error/30 focus:bg-surface transition-all resize-none shadow-inner"
          />
          <div className="flex justify-between items-center mt-2 px-1">
             <p className="text-[10px] text-error font-bold">Це допоможе вашому партнеру виправити помилки</p>
             <p className="text-[10px] font-black text-ink-soft uppercase tabular-nums">
                {reason.length}/500
             </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest"
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            variant="error"
            disabled={loading || !reason.trim()}
            isLoading={loading}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-error/20"
          >
            Відхилити
          </Button>
        </div>
      </form>
    </Modal>
  )
}