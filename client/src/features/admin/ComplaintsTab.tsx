import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Flag } from 'lucide-react'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { RESOLVE_COMPLAINT, BLOCK_USER } from '../../api/queries'
import type { AdminComplaintItem, ApiError } from '../../api/types'

interface ResolveComplaintData {
    admin: { resolveComplaint: { success: boolean; error: ApiError | null } }
}
interface BlockUserData {
    admin: { blockUser: { success: boolean; error: ApiError | null } }
}
import { PageSpinner } from '../../components/Spinner'
import Card from '../../components/ui/Card'
import UserLink from '../../components/ui/UserLink'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/Modal'
import { formatDateTime } from '../../hooks/useDateTime'

export interface ComplaintsTabProps {
    items: AdminComplaintItem[]
    loading: boolean
    onRefresh: () => void
}

export default function ComplaintsTab({ items, loading, onRefresh }: ComplaintsTabProps) {
    const dispatch = useAppDispatch()
    const [blockModal, setBlockModal] = useState<{ userId: string; username: string; complaintId?: string } | null>(null)
    const [resolveModal, setResolveModal] = useState<string | null>(null)
    const [comment, setComment] = useState('')
    const [blockForm, setBlockForm] = useState({ reason: '', hours: '24' })

    const BLOCK_PRESETS = [
        { label: '1 д', hours: 24 }, { label: '3 д', hours: 72 },
        { label: '7 д', hours: 168 }, { label: '30 д', hours: 720 },
        { label: '∞', hours: 0 },
    ]

    const [resolve, { loading: resolving }] = useMutation<ResolveComplaintData>(RESOLVE_COMPLAINT, {
        onCompleted: (data) => {
            const r = data.admin.resolveComplaint
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else {
                dispatch(addToast({ type: 'success', message: 'Скаргу розглянуто' }))
                setResolveModal(null)
                setComment('')
                onRefresh()
            }
        },
    })

    const [blockUser, { loading: blocking }] = useMutation<BlockUserData>(BLOCK_USER, {
        onCompleted: async (data) => {
            const r = data.admin.blockUser
            if (r.error) {
                dispatch(addToast({ type: 'error', message: r.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Користувача заблоковано' }))

                // Якщо блокування було через скаргу - резолвимо її
                if (blockModal?.complaintId) {
                    resolve({
                        variables: {
                            complaintId: blockModal.complaintId,
                            adminComment: `Користувача заблоковано: ${blockForm.reason}`
                        }
                    })
                }

                setBlockModal(null)
            }
        },
    })

    if (loading) return <PageSpinner />

    return (
        <div className="space-y-4">
            {items.length === 0 && (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
                    <Flag size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                    <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Скарг немає</p>
                </div>
            )}
            {items.map((c: AdminComplaintItem) => (
                <Card key={c.id} padding="md" className={c.isResolved ? 'opacity-60 grayscale-[0.5]' : ''}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0">
                                    <Flag size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-ink">
                                        Скарга на <UserLink userId={c.targetUserId} username={c.targetUsername} className="text-primary" />
                                    </p>
                                    <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                        Від: <UserLink userId={c.reporterUserId} username={c.reporterUsername} /> • {formatDateTime(c.createdAtUtc)}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-surface-muted/50 p-4 rounded-2xl border border-border/50 text-sm text-ink leading-relaxed">
                                {c.reason}
                            </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2">
                            {!c.isResolved && (
                                <>
                                    <Button size="sm" onClick={() => setResolveModal(c.id)}>Розглянуто</Button>
                                    <Button variant="error" size="sm" onClick={() => setBlockModal({ userId: c.targetUserId, username: c.targetUsername, complaintId: c.id })}>Заблокувати</Button>
                                </>
                            )}
                            {c.isResolved && <Badge variant="outline">Розглянуто</Badge>}
                        </div>
                    </div>
                </Card>
            ))}

            <Modal isOpen={!!blockModal} onClose={() => setBlockModal(null)} title={`Блокування: ${blockModal?.username}`}>
                <div className="space-y-6 p-2">
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Тривалість</label>
                        <div className="flex flex-wrap gap-2">
                            {BLOCK_PRESETS.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => setBlockForm({ ...blockForm, hours: p.hours.toString() })}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${blockForm.hours === p.hours.toString()
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-surface-muted text-ink-soft hover:bg-surface border border-border'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Причина (публічна)</label>
                        <input
                            type="text"
                            value={blockForm.reason}
                            onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}
                            placeholder="Напр: Порушення правил спілкування"
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setBlockModal(null)}>Скасувати</Button>
                        <Button
                            variant="error"
                            className="flex-1"
                            disabled={blocking || !blockForm.reason}
                            onClick={() => {
                                const until = blockForm.hours === '0' ? null : new Date(Date.now() + parseInt(blockForm.hours) * 60 * 60 * 1000).toISOString()
                                blockUser({
                                    variables: {
                                        targetUserId: blockModal!.userId,
                                        reason: blockForm.reason,
                                        blockedUntilUtc: until
                                    }
                                })
                            }}
                        >
                            {blocking ? 'Блокування...' : 'Підтвердити'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!resolveModal} onClose={() => { setResolveModal(null); setComment(''); }} title="Розгляд скарги">
                <div className="space-y-5 p-2">
                    <p className="text-sm text-ink-muted">
                        Вкажіть коментар щодо розгляду скарги. Користувач, який залишив скаргу, отримає сповіщення.
                    </p>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        placeholder="Ваша відповідь (необов'язково)..."
                        className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner resize-none"
                    />
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => { setResolveModal(null); setComment(''); }}>
                            Скасувати
                        </Button>
                        <Button
                            onClick={() => resolve({ variables: { complaintId: resolveModal!, adminComment: comment || null } })}
                            disabled={resolving}
                            className="flex-1 shadow-md"
                        >
                            {resolving ? 'Обробка...' : 'Підтвердити'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
