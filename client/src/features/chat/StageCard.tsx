import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface StageCardProps {
    stageId: string
    content: string
    status: number // 0=Pending, 1=Confirmed, 2=Rejected, 3=Deleted
    proposedByUserId: string
    rejectionReason?: string | null
    currentUserId: string | null
    onConfirm: (stageId: string) => void
    onReject: (stageId: string) => void
    confirming: boolean
}

const STATUS_CONFIG = {
    0: { label: 'Очікує підтвердження', color: 'border-warning/30 bg-warning/5' },
    1: { label: 'Підтверджено', color: 'border-success/30 bg-success/5' },
    2: { label: 'Відхилено', color: 'border-error/30 bg-error/5' },
    3: { label: 'Видалено', color: 'border-border bg-surface-muted' },
} as const

export default function StageCard({
    stageId,
    content,
    status,
    proposedByUserId,
    rejectionReason,
    currentUserId,
    onConfirm,
    onReject,
    confirming,
}: StageCardProps) {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    const canAct = status === 0 && proposedByUserId !== currentUserId

    return (
        <div className={`rounded-xl border p-3 ${config.color}`}>
            <div className="flex items-start gap-2 mb-2">
                <Clock size={14} className="text-ink-muted mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                        Етап запропоновано
                    </p>
                    <p className="text-sm text-ink leading-relaxed">{content}</p>
                </div>
            </div>

            {rejectionReason && (
                <p className="text-xs text-error mt-1 mb-2">
                    Причина: {rejectionReason}
                </p>
            )}

            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <span className="text-xs text-ink-muted">{config.label}</span>

                {canAct && (
                    <div className="flex gap-1.5 flex-wrap">
                        <button
                            onClick={() => onConfirm(stageId)}
                            disabled={confirming}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-success text-white rounded-lg hover:opacity-90 disabled:opacity-60 transition-colors"
                        >
                            <CheckCircle size={11} />
                            Підтвердити
                        </button>
                        <button
                            onClick={() => onReject(stageId)}
                            disabled={confirming}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-error text-white rounded-lg hover:opacity-90 disabled:opacity-60 transition-colors"
                        >
                            <XCircle size={11} />
                            Відхилити
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}