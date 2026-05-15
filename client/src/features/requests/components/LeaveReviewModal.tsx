import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import Modal from '../../../components/Modal'
import { LEAVE_REVIEW } from '../../../api/queries'
import type { LeaveReviewData } from '../../../api/types'
import { useAppDispatch } from '../../../store/hooks'
import { addToast } from '../../../store/uiSlice'

interface LeaveReviewModalProps {
    isOpen: boolean
    onClose: () => void
    helpRequestId: string
    onSuccess: () => void
    targetName?: string
}

export default function LeaveReviewModal({
    isOpen,
    onClose,
    helpRequestId,
    onSuccess,
    targetName = 'власником заявки'
}: LeaveReviewModalProps) {
    const dispatch = useAppDispatch()
    const [isPositive, setIsPositive] = useState<boolean | null>(null)
    const [comment, setComment] = useState('')

    const [leaveReview, { loading }] = useMutation<LeaveReviewData>(LEAVE_REVIEW, {
        onCompleted: (data) => {
            const result = data.user.leaveReview
            if (result.error) {
                dispatch(addToast({ type: 'error', message: result.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Відгук залишено!' }))
                setIsPositive(null)
                setComment('')
                onClose()
                onSuccess()
            }
        },
        onError: () =>
            dispatch(addToast({ type: 'error', message: 'Не вдалося залишити відгук' })),
    })

    const handleSubmit = () => {
        if (isPositive === null) {
            dispatch(addToast({ type: 'error', message: 'Оберіть оцінку' }))
            return
        }
        leaveReview({
            variables: {
                helpRequestId,
                isPositive,
                comment: comment.trim() || null,
            },
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Залишити відгук">
            <div className="space-y-5">
                <p className="text-sm text-ink-muted">
                    Оцініть взаємодію з {targetName}
                </p>

                {/* Вибір оцінки */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsPositive(true)}
                        className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${isPositive === true
                                ? 'border-success bg-success/10 text-success'
                                : 'border-border text-ink-muted hover:border-success/50'
                            }`}
                    >
                        <ThumbsUp size={24} />
                        <span className="text-sm font-medium">Позитивно</span>
                    </button>
                    <button
                        onClick={() => setIsPositive(false)}
                        className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${isPositive === false
                                ? 'border-error bg-error/10 text-error'
                                : 'border-border text-ink-muted hover:border-error/50'
                            }`}
                    >
                        <ThumbsDown size={24} />
                        <span className="text-sm font-medium">Негативно</span>
                    </button>
                </div>

                {/* Коментар */}
                <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                        Коментар{' '}
                        <span className="normal-case font-normal">(необов'язково)</span>
                    </label>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Розкажіть про свій досвід..."
                        maxLength={1000}
                        rows={3}
                        className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-ink placeholder-ink-soft focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                    />
                    <p className="text-xs text-ink-soft mt-1 text-right">{comment.length}/1000</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-ink hover:border-primary transition-colors"
                    >
                        Скасувати
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || isPositive === null}
                        className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Надсилання...' : 'Надіслати'}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
