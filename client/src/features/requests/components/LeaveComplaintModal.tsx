import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { Flag } from 'lucide-react'
import Modal from '../../../components/Modal'
import { GET_PROFILE, LEAVE_COMPLAINT } from '../../../api/queries'
import type { LeaveComplaintData, ProfileData } from '../../../api/types'
import { useAppDispatch } from '../../../store/hooks'
import { addToast } from '../../../store/uiSlice'

interface LeaveComplaintModalProps {
    isOpen: boolean
    onClose: () => void
    targetUserId: string
    targetUsername: string
}

export default function LeaveComplaintModal({
    isOpen,
    onClose,
    targetUserId,
    targetUsername,
}: LeaveComplaintModalProps) {
    const dispatch = useAppDispatch()
    const [reason, setReason] = useState('')
    const { data: profileData } = useQuery<ProfileData>(GET_PROFILE)
    
    const dailyComplaintsCount = profileData?.userQuery.profile.profile?.dailyComplaintsCount ?? 0
    const limitReached = dailyComplaintsCount >= 15

    const [leaveComplaint, { loading }] = useMutation<LeaveComplaintData>(LEAVE_COMPLAINT, {
        refetchQueries: [{ query: GET_PROFILE }],
        onCompleted: (data) => {
            const result = data.user.leaveComplaint
            if (result.error) {
                dispatch(addToast({ type: 'error', message: result.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Скаргу надіслано на розгляд' }))
                setReason('')
                onClose()
            }
        },
        onError: () =>
            dispatch(addToast({ type: 'error', message: 'Не вдалося надіслати скаргу' })),
    })

    const handleSubmit = () => {
        if (!reason.trim()) {
            dispatch(addToast({ type: 'error', message: 'Вкажіть причину скарги' }))
            return
        }
        leaveComplaint({ variables: { targetUserId, reason: reason.trim() } })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Поскаржитись на користувача">
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-error/10 rounded-lg">
                    <Flag size={14} className="text-error shrink-0" />
                    <p className="text-sm text-error">
                        Скарга на{' '}
                        <span className="font-semibold">{targetUsername}</span>
                    </p>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                        Причина скарги
                    </label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Опишіть що сталося..."
                        maxLength={1000}
                        rows={4}
                        className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-ink placeholder-ink-soft focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                    />
                    <p className="text-xs text-ink-soft mt-1 text-right">{reason.length}/1000</p>
                </div>

                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">
                        Скарг на сьогодні: <span className={limitReached ? 'text-error' : 'text-ink'}>{dailyComplaintsCount}/15</span>
                    </p>
                    {limitReached && (
                        <p className="text-[10px] font-bold text-error uppercase tracking-widest animate-pulse">
                            Ліміт вичерпано
                        </p>
                    )}
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
                        disabled={loading || !reason.trim() || limitReached}
                        className="flex-1 py-2.5 bg-error text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-colors"
                    >
                        {loading ? 'Надсилання...' : 'Надіслати скаргу'}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
