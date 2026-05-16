import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { Search, X, FileText, Eye, EyeOff } from 'lucide-react'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { APPROVE_HELP_REQUEST, REJECT_HELP_REQUEST, HIDE_HELP_REQUEST } from '../../api/queries'
import type { AdminHelpRequestItem, ApproveHelpRequestData, RejectHelpRequestData, ApiError } from '../../api/types'

interface HideHelpRequestData {
    admin: { hideHelpRequest: { success: boolean; error: ApiError | null } }
}
import { PageSpinner } from '../../components/Spinner'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/Modal'
import { formatDateTime } from '../../hooks/useDateTime'

const HELP_REQUEST_STATUS_CONFIG: Record<number, { label: string; variant: string }> = {
    0: { label: 'На модерації', variant: 'warning' },
    1: { label: 'Активний', variant: 'success' },
    2: { label: 'Завершений', variant: 'info' },
    3: { label: 'Відхилено', variant: 'error' },
}

export interface RequestsTabProps {
    items: AdminHelpRequestItem[]
    loading: boolean
    onRefresh: () => void
    filter: 'all' | 'moderation' | 'active' | 'completed' | 'hidden'
    onFilterChange: (f: 'all' | 'moderation' | 'active' | 'completed' | 'hidden') => void
    search: string
    onSearchChange: (s: string) => void
}

export default function RequestsTab({ items, loading, onRefresh, filter, onFilterChange, search, onSearchChange }: RequestsTabProps) {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    const [approveReq] = useMutation<ApproveHelpRequestData>(APPROVE_HELP_REQUEST, {
        onCompleted: (data) => {
            const r = data.admin.approveHelpRequest
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else { dispatch(addToast({ type: 'success', message: 'Заявку схвалено' })); onRefresh() }
        }
    })

    const [rejectReq, { loading: rejecting }] = useMutation<RejectHelpRequestData>(REJECT_HELP_REQUEST, {
        onCompleted: (data) => {
            const r = data.admin.rejectHelpRequest
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else {
                dispatch(addToast({ type: 'success', message: 'Заявку відхилено' }))
                setRejectModal(null)
                setRejectReason('')
                onRefresh()
            }
        }
    })

    const [hideReq] = useMutation<HideHelpRequestData>(HIDE_HELP_REQUEST, {
        onCompleted: (data) => {
            const r = data.admin.hideHelpRequest
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else { dispatch(addToast({ type: 'success', message: 'Статус змінено' })); onRefresh() }
        },
    })

    const filterOptions: { id: typeof filter; label: string }[] = [
        { id: 'all', label: 'Всі' },
        { id: 'moderation', label: 'На модерації' },
        { id: 'active', label: 'Активні' },
        { id: 'completed', label: 'Завершені' },
        { id: 'hidden', label: 'Приховані' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-muted/30 p-4 rounded-3xl border border-border/50">
                <div className="flex flex-wrap gap-1.5 p-1 bg-surface-muted rounded-2xl border border-border/50">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => onFilterChange(opt.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === opt.id
                                ? 'bg-surface text-primary shadow-sm ring-1 ring-border'
                                : 'text-ink-soft hover:text-ink hover:bg-surface'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Пошук за назвою..."
                        className="w-full pl-11 pr-10 py-3 bg-surface border border-border rounded-2xl text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                    {search && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-error transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <PageSpinner />
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
                        <FileText size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                        <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">
                            {search ? 'За вашим запитом нічого не знайдено' : 'Запитів немає'}
                        </p>
                    </div>
                ) : (
                    items.map((hr: AdminHelpRequestItem) => (
                        <Card key={hr.id} padding="sm" className={hr.isHidden ? 'opacity-60 grayscale-[0.5]' : ''}>
                            <div className="flex items-center justify-between gap-4">
                                <div
                                    className="min-w-0 flex-1 cursor-pointer group/item"
                                    onClick={() => navigate(`/requests/${hr.id}`)}
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-ink truncate text-base group-hover/item:text-primary transition-colors">{hr.title}</span>
                                        {hr.isHidden && <Badge variant="error">Приховано</Badge>}
                                        {hr.isDeleted && <Badge variant="error" className="bg-error text-black font-black">Видалено</Badge>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                        <span className="text-primary font-bold">{hr.creatorUsername}</span>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <Badge variant={(HELP_REQUEST_STATUS_CONFIG[hr.status]?.variant as 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline') || 'default'}>
                                            {HELP_REQUEST_STATUS_CONFIG[hr.status]?.label}
                                        </Badge>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <span>{formatDateTime(hr.createdAtUtc)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {hr.status === 0 && (
                                        <div className="flex gap-2 mr-2 pr-4 border-r border-border">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    approveReq({ variables: { helpRequestId: hr.id } });
                                                }}
                                            >
                                                Схвалити
                                            </Button>
                                            <Button
                                                variant="error"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRejectModal({ id: hr.id, title: hr.title });
                                                }}
                                            >
                                                Відхилити
                                            </Button>
                                        </div>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            hideReq({ variables: { helpRequestId: hr.id, hide: !hr.isHidden } });
                                        }}
                                    >
                                        {hr.isHidden ? <Eye size={14} className="mr-2" /> : <EyeOff size={14} className="mr-2" />}
                                        {hr.isHidden ? 'Показати' : 'Приховати'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Modal
                isOpen={!!rejectModal}
                onClose={() => { setRejectModal(null); setRejectReason(''); }}
                title="Відхилити заявку"
            >
                <div className="space-y-6 p-2">
                    <div className="bg-error/5 p-4 rounded-2xl border border-error/10">
                        <p className="text-sm font-bold text-ink mb-1">Ви відхиляєте заявку:</p>
                        <p className="text-xs text-ink-soft italic">"{rejectModal?.title}"</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Причина відхилення (буде надіслана автору)</label>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Напр: Недостовірна інформація, нецензурна лексика тощо..."
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner resize-none"
                            rows={4}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setRejectModal(null)}>Скасувати</Button>
                        <Button
                            variant="error"
                            className="flex-1"
                            disabled={rejecting || !rejectReason.trim()}
                            onClick={() => rejectReq({ variables: { helpRequestId: rejectModal!.id, reason: rejectReason } })}
                        >
                            {rejecting ? 'Обробка...' : 'Підтвердити'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
