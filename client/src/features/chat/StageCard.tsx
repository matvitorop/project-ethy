import { CheckCircle, XCircle, Clock, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'

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
    0: { label: 'Очікує підтвердження', color: 'border-primary/20 bg-primary/5 text-primary', icon: Clock },
    1: { label: 'Підтверджено', color: 'border-success/20 bg-success/5 text-success', icon: CheckCircle },
    2: { label: 'Відхилено', color: 'border-error/20 bg-error/5 text-error', icon: XCircle },
    3: { label: 'Видалено', color: 'border-border bg-surface-muted text-ink-soft', icon: Info },
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
    const StatusIcon = config.icon

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border-2 p-4 transition-all shadow-sm ${config.color}`}
        >
            <div className="flex items-center gap-2 mb-3">
                <StatusIcon size={14} className="opacity-80" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80" style={{ fontFamily: 'Jua, sans-serif' }}>
                    {config.label}
                </span>
            </div>

            <div className="bg-surface/50 backdrop-blur-sm rounded-xl p-3 border border-current/10 mb-3 shadow-inner">
                <p className="text-sm font-semibold text-ink leading-relaxed">
                    {content}
                </p>
            </div>

            {rejectionReason && (
                <div className="flex items-start gap-2 text-error bg-error/10 p-2.5 rounded-xl border border-error/20 mb-3">
                    <XCircle size={14} className="mt-0.5 shrink-0" />
                    <p className="text-xs font-bold leading-relaxed">
                        Причина відмови: {rejectionReason}
                    </p>
                </div>
            )}

            {canAct && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                        variant="success"
                        size="sm"
                        onClick={() => onConfirm(stageId)}
                        isLoading={confirming}
                        className="py-2 text-[10px] font-black uppercase tracking-widest shadow-md shadow-success/20"
                    >
                        Підтвердити
                    </Button>
                    <Button
                        variant="error"
                        size="sm"
                        onClick={() => onReject(stageId)}
                        isLoading={confirming}
                        className="py-2 text-[10px] font-black uppercase tracking-widest shadow-md shadow-error/20"
                    >
                        Відхилити
                    </Button>
                </div>
            )}
        </motion.div>
    )
}