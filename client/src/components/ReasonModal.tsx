import { useState } from 'react'
import Modal from './Modal'
import { AlertCircle } from 'lucide-react'

interface ReasonModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
    title: string
    description?: string
    confirmText?: string
    confirmVariant?: 'primary' | 'error' | 'success'
    isLoading?: boolean
    placeholder?: string
    tip?: string
    maxLength?: number
}

export default function ReasonModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Підтвердити',
    confirmVariant = 'primary',
    isLoading = false,
    placeholder = 'Вкажіть причину...',
    tip,
    maxLength = 500
}: ReasonModalProps) {
    const [reason, setReason] = useState('')

    const handleClose = () => {
        setReason('')
        onClose()
    }

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!reason.trim() || isLoading) return
        onConfirm(reason.trim())
    }

    const getVariantClasses = () => {
        switch (confirmVariant) {
            case 'error': return 'bg-error text-white shadow-error/20 hover:bg-error/90'
            case 'success': return 'bg-success text-white shadow-success/20 hover:bg-success/90'
            default: return 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {description && (
                    <div className="flex gap-3 p-4 bg-surface-muted/50 rounded-2xl border border-border/50">
                        <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-ink-muted leading-relaxed font-medium">
                            {description}
                        </p>
                    </div>
                )}

                <div className="relative">
                    <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3 ml-1">
                        Причина (обов'язково)
                    </label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        rows={4}
                        className="w-full px-5 py-4 bg-surface-muted border-2 border-border rounded-2xl text-base font-medium text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary/30 focus:bg-surface transition-all resize-none shadow-inner"
                    />
                    
                    <div className="flex justify-between items-center mt-2 px-1">
                        {tip ? (
                            <p className="text-[10px] text-ink-soft font-bold italic">{tip}</p>
                        ) : (
                            <div />
                        )}
                        <p className="text-[10px] font-black text-ink-soft uppercase tabular-nums">
                            {reason.length}/{maxLength}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 py-3.5 px-6 border-2 border-border rounded-2xl text-[11px] font-black uppercase tracking-widest text-ink-soft hover:text-ink hover:bg-surface-muted transition-all disabled:opacity-50"
                    >
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !reason.trim()}
                        className={`flex-1 py-3.5 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 disabled:grayscale ${getVariantClasses()}`}
                    >
                        {isLoading ? 'Надсилання...' : confirmText}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
