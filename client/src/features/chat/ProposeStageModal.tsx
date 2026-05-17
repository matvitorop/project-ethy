import { useState } from 'react'
import Modal from '../../components/Modal'
import Button from '../../components/ui/Button'

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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3 ml-1">
            Опис етапу
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Опишіть що саме ви плануєте зробити або яку допомогу надати на цьому етапі..."
            maxLength={500}
            rows={4}
            className="w-full px-4 py-4 bg-surface-muted border-2 border-border rounded-2xl text-sm font-medium text-ink placeholder-ink-soft focus:outline-none focus:border-primary/30 focus:bg-surface transition-all resize-none shadow-inner"
          />
          <div className="flex justify-between items-center mt-2 px-1">
             <p className="text-[10px] text-ink-soft font-bold">Будьте лаконічними та зрозумілими</p>
             <p className="text-[10px] font-black text-ink-soft uppercase tabular-nums">
                {content.length}/500
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
            disabled={loading || !content.trim()}
            isLoading={loading}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            Запропонувати
          </Button>
        </div>
      </form>
    </Modal>
  )
}