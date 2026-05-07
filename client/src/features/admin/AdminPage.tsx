import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Shield, FileText, Flag, Eye, EyeOff, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import {
    GET_VOLUNTEER_APPLICATIONS, GET_COMPLAINTS, GET_ADMIN_HELP_REQUESTS,
    REVIEW_VOLUNTEER_APPLICATION, RESOLVE_COMPLAINT, HIDE_HELP_REQUEST,
    BLOCK_USER,
} from '../../api/queries'
import type {
    VolunteerApplicationsData, ComplaintsData, AdminHelpRequestsData,
    VolunteerApplicationItem, AdminComplaintItem, AdminHelpRequestItem, ApiError,
} from '../../api/types'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import Modal from '../../components/Modal'
import { PageSpinner } from '../../components/Spinner'

type Tab = 'volunteers' | 'complaints' | 'requests'
const API_BASE_URL = 'http://localhost:5274'
interface AdminActionResult { success: boolean | null; error: ApiError | null }
interface ReviewVolunteerData { admin: { reviewVolunteerApplication: AdminActionResult } }
interface ResolveComplaintData { admin: { resolveComplaint: AdminActionResult } }
interface BlockUserData { admin: { blockUser: AdminActionResult } }
interface HideHelpRequestData { admin: { hideHelpRequest: AdminActionResult } }

const STATUS_LABELS: Record<number, string> = { 0: 'Очікує', 1: 'Схвалено', 2: 'Відхилено' }
const STATUS_COLORS: Record<number, string> = {
    0: 'text-accent bg-accent/10',
    1: 'text-success bg-success/10',
    2: 'text-error bg-error/10',
}
const REQUEST_STATUS: Record<number, string> = {
    0: 'Чернетка', 1: 'Відкрита', 2: 'В процесі', 3: 'Виконана', 4: 'Скасована'
}

export default function AdminPage() {
    const [tab, setTab] = useState<Tab>('volunteers')
    const { data: appData, loading: appLoading, refetch: refetchApps } =
        useQuery<VolunteerApplicationsData>(GET_VOLUNTEER_APPLICATIONS, {
            variables: { status: 0 }, fetchPolicy: 'cache-and-network',
        })
    const { data: complData, loading: complLoading, refetch: refetchCompl } =
        useQuery<ComplaintsData>(GET_COMPLAINTS, {
            variables: { isResolved: false }, fetchPolicy: 'cache-and-network',
        })
    const { data: hrData, loading: hrLoading, refetch: refetchHR } =
        useQuery<AdminHelpRequestsData>(GET_ADMIN_HELP_REQUESTS, {
            variables: { page: 1, pageSize: 30 }, fetchPolicy: 'cache-and-network',
        })

    const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
        { key: 'volunteers', label: 'Заявки волонтерів', icon: <Shield size={16} />, count: appData?.adminQuery.volunteerApplications.items?.length },
        { key: 'complaints', label: 'Скарги', icon: <Flag size={16} />, count: complData?.adminQuery.complaints.items?.length },
        { key: 'requests', label: 'Заявки', icon: <FileText size={16} /> },
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
                <Shield size={24} className="text-primary" />
                <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Jua, sans-serif' }}>
                    Адмін-панель
                </h1>
            </div>

            <div className="flex gap-1 bg-surface-muted rounded-xl p-1 border border-border">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            tab === t.key ? 'bg-surface text-primary shadow-sm border border-border' : 'text-ink-muted hover:text-ink'
                        }`}>
                        {t.icon}{t.label}
                        {t.count !== undefined && t.count > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-error text-white text-xs rounded-full">{t.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {tab === 'volunteers' && <VolunteersTab items={appData?.adminQuery.volunteerApplications.items ?? []} loading={appLoading} onRefresh={refetchApps} />}
            {tab === 'complaints' && <ComplaintsTab items={complData?.adminQuery.complaints.items ?? []} loading={complLoading} onRefresh={refetchCompl} />}
            {tab === 'requests' && <RequestsTab items={hrData?.adminQuery.helpRequests.items ?? []} loading={hrLoading} onRefresh={refetchHR} />}
        </div>
    )
}

// ===================== VOLUNTEERS TAB =====================
interface VolunteersTabProps { items: VolunteerApplicationItem[]; loading: boolean; onRefresh: () => void }

function VolunteersTab({ items, loading, onRefresh }: VolunteersTabProps) {
    const dispatch = useAppDispatch()
    const [expanded, setExpanded] = useState<string | null>(null)
    const [reviewModal, setReviewModal] = useState<{ id: string; approve: boolean } | null>(null)
    const [comment, setComment] = useState('')

    const [review, { loading: reviewing }] = useMutation<ReviewVolunteerData>(REVIEW_VOLUNTEER_APPLICATION, {
        onCompleted: (data) => {
            const r = data.admin.reviewVolunteerApplication
            if (r.error) {
                dispatch(addToast({ type: 'error', message: r.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: reviewModal?.approve ? 'Схвалено!' : 'Відхилено' }))
                setReviewModal(null)
                setComment('')
                onRefresh()
            }
        },
    })

    if (loading) return <PageSpinner />

    return (
        <div className="space-y-3">
            {items.length === 0 && <div className="text-center py-12 text-ink-muted">Нових заявок немає</div>}
            {items.map(app => (
                <div key={app.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-muted transition-colors"
                        onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-ink">{app.username}</span>
                            <span className="text-sm text-ink-muted">{app.organizationName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                                {STATUS_LABELS[app.status]}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-ink-soft">{new Date(app.submittedAtUtc).toLocaleDateString('uk-UA')}</span>
                            {expanded === app.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                    </div>

                    {expanded === app.id && (
                        <div className="px-4 pb-4 border-t border-border space-y-3">
                            <div className="pt-3">
                                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Опис діяльності</p>
                                <p className="text-sm text-ink">{app.activityDescription}</p>
                            </div>
                            {app.documentImageUrl && (
                                <div>
                                    <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Документ</p>
                                    <a                                          
                                        href={`${API_BASE_URL}/uploads/volunteer-documents/${app.documentImageUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img
                                            src={`${API_BASE_URL}/uploads/volunteer-documents/${app.documentImageUrl}`}
                                            alt="Документ волонтера"
                                            className="max-h-48 rounded-lg border border-border object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                        />
                                    </a>
                                    <p className="text-xs text-ink-muted mt-1">Натисніть для перегляду у повному розмірі</p>
                                </div>
                            )}
                            {app.status === 0 && (
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setReviewModal({ id: app.id, approve: true })}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-success text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors">
                                        <Check size={14} /> Схвалити
                                    </button>
                                    <button onClick={() => setReviewModal({ id: app.id, approve: false })}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-error text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors">
                                        <X size={14} /> Відхилити
                                    </button>
                                </div>
                            )}
                            {app.adminComment && <p className="text-xs text-ink-muted">Коментар: {app.adminComment}</p>}
                        </div>
                    )}
                </div>
            ))}

            <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setComment('') }}
                title={reviewModal?.approve ? 'Схвалити заявку' : 'Відхилити заявку'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                            Коментар <span className="normal-case font-normal">(необов'язково)</span>
                        </label>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                            placeholder="Коментар для користувача..."
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary resize-none" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setReviewModal(null); setComment('') }}
                            className="flex-1 py-2.5 border border-border rounded-lg text-sm text-ink hover:border-primary transition-colors">
                            Скасувати
                        </button>
                        <button
                            onClick={() => review({ variables: { applicationId: reviewModal!.id, approve: reviewModal!.approve, comment: comment || null } })}
                            disabled={reviewing}
                            className={`flex-1 py-2.5 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors ${reviewModal?.approve ? 'bg-success hover:opacity-90' : 'bg-error hover:opacity-90'}`}>
                            {reviewing ? 'Обробка...' : reviewModal?.approve ? 'Схвалити' : 'Відхилити'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ===================== COMPLAINTS TAB =====================
interface ComplaintsTabProps { items: AdminComplaintItem[]; loading: boolean; onRefresh: () => void }

function ComplaintsTab({ items, loading, onRefresh }: ComplaintsTabProps) {
    const dispatch = useAppDispatch()
    const [blockModal, setBlockModal] = useState<{
        userId: string; username: string; complaintId: string} | null>(null)
    const [blockForm, setBlockForm] = useState({ reason: '', hours: '24', adminComment: '' })
    const [resolveModal, setResolveModal] = useState<{ complaintId: string } | null>(null)
    const [resolveComment, setResolveComment] = useState('')

    const BLOCK_PRESETS = [
        { label: '1 день', hours: 24 }, { label: '3 дні', hours: 72 },
        { label: '7 днів', hours: 168 }, { label: '30 днів', hours: 720 },
        { label: 'Безстроково', hours: 0 },
    ]

    const [resolve] = useMutation<ResolveComplaintData>(RESOLVE_COMPLAINT, {
        onCompleted: (data) => {
            const r = data.admin.resolveComplaint
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else { dispatch(addToast({ type: 'success', message: 'Скаргу розглянуто' })); onRefresh() }
        },
    })

    const [blockUser, { loading: blocking }] = useMutation<BlockUserData>(BLOCK_USER, {
        onCompleted: async (data) => {
            const r = data.admin.blockUser
            if (r.error) {
                dispatch(addToast({ type: 'error', message: r.error.message }))
            } else {
                // Автоматично закриваємо скаргу
                await resolve({
                    variables: {
                        complaintId: blockModal!.complaintId,
                        adminComment: blockForm.adminComment || null
                    }
                })
                dispatch(addToast({ type: 'success', message: 'Користувача заблоковано, скаргу закрито' }))
                setBlockModal(null)
                setBlockForm({ reason: '', hours: '24', adminComment: '' })
                onRefresh()
            }
        },
    })

    const handleBlock = () => {
        const hours = parseInt(blockForm.hours)
        const blockedUntil = hours > 0 ? new Date(Date.now() + hours * 3600000).toISOString() : null
        blockUser({ variables: { targetUserId: blockModal!.userId, reason: blockForm.reason, blockedUntilUtc: blockedUntil } })
    }

    if (loading) return <PageSpinner />

    return (
        <div className="space-y-3">
            {items.length === 0 && <div className="text-center py-12 text-ink-muted">Нових скарг немає</div>}
            {items.map(c => (
                <div key={c.id} className="bg-surface rounded-xl border border-border p-4 space-y-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-ink-muted">Від:</span>
                            <span className="font-medium text-ink">{c.reporterUsername}</span>
                            <span className="text-ink-muted">на</span>
                            <span className="font-medium text-ink">{c.targetUsername}</span>
                        </div>
                        <p className="text-sm text-ink">{c.reason}</p>
                        <p className="text-xs text-ink-soft">{new Date(c.createdAtUtc).toLocaleDateString('uk-UA')}</p>
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-border">
                        <button onClick={() => setBlockModal({
                            userId: c.targetUserId,
                            username: c.targetUsername,
                            complaintId: c.id
                        })}
                            className="px-3 py-1.5 text-xs font-medium bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors">
                            Заблокувати {c.targetUsername}
                        </button>
                        <button onClick={() => setResolveModal({ complaintId: c.id })}
                            className="px-3 py-1.5 text-xs font-medium bg-surface-muted text-ink-muted rounded-lg hover:text-success transition-colors border border-border">
                            Позначити розглянутою
                        </button>
                    </div>
                </div>
            ))}

            <Modal isOpen={!!blockModal} onClose={() => setBlockModal(null)} title={`Заблокувати ${blockModal?.username}`}>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {BLOCK_PRESETS.map(p => (
                            <button key={p.label} onClick={() => setBlockForm(f => ({ ...f, hours: String(p.hours) }))}
                                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                    blockForm.hours === String(p.hours) ? 'bg-primary text-white border-primary' : 'border-border text-ink hover:border-primary'
                                }`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Причина блокування</label>
                        <textarea value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                            rows={3} placeholder="Вкажіть причину..."
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary resize-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                            Відповідь скаржнику <span className="normal-case font-normal">(необов'язково)</span>
                        </label>
                        <textarea value={blockForm.adminComment}
                            onChange={e => setBlockForm(f => ({ ...f, adminComment: e.target.value }))}
                            rows={2} placeholder="Повідомлення для скаржника..."
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary resize-none" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setBlockModal(null)}
                            className="flex-1 py-2.5 border border-border rounded-lg text-sm text-ink hover:border-primary transition-colors">
                            Скасувати
                        </button>
                        <button onClick={handleBlock} disabled={blocking || !blockForm.reason.trim()}
                            className="flex-1 py-2.5 bg-error text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-colors">
                            {blocking ? 'Блокування...' : 'Заблокувати'}
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={!!resolveModal} onClose={() => { setResolveModal(null); setResolveComment('') }}
                title="Розглянути скаргу">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                            Відповідь скаржнику <span className="normal-case font-normal">(необов'язково)</span>
                        </label>
                        <textarea value={resolveComment} onChange={e => setResolveComment(e.target.value)}
                            rows={3} placeholder="Опишіть результат розгляду..."
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary resize-none" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setResolveModal(null); setResolveComment('') }}
                            className="flex-1 py-2.5 border border-border rounded-lg text-sm text-ink hover:border-primary transition-colors">
                            Скасувати
                        </button>
                        <button onClick={() => {
                            resolve({ variables: { complaintId: resolveModal!.complaintId, adminComment: resolveComment || null } })
                            setResolveModal(null)
                            setResolveComment('')
                        }}
                            className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors">
                            Підтвердити
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ===================== REQUESTS TAB =====================
interface RequestsTabProps { items: AdminHelpRequestItem[]; loading: boolean; onRefresh: () => void }

function RequestsTab({ items, loading, onRefresh }: RequestsTabProps) {
    const dispatch = useAppDispatch()

    const [hideReq] = useMutation<HideHelpRequestData>(HIDE_HELP_REQUEST, {
        onCompleted: (data) => {
            const r = data.admin.hideHelpRequest
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else { dispatch(addToast({ type: 'success', message: 'Оновлено' })); onRefresh() }
        },
    })

    if (loading) return <PageSpinner />

    return (
        <div className="space-y-2">
            {items.length === 0 && <div className="text-center py-12 text-ink-muted">Заявок немає</div>}
            {items.map(hr => (
                <div key={hr.id} className={`bg-surface rounded-xl border p-4 flex items-center justify-between gap-3 ${hr.isHidden ? 'border-error/30 opacity-60' : 'border-border'}`}>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-ink truncate">{hr.title}</span>
                            {hr.isHidden && <span className="text-xs px-2 py-0.5 bg-error/10 text-error rounded-full">Прихована</span>}
                            {hr.isDeleted && <span className="text-xs px-2 py-0.5 bg-surface-muted text-ink-muted rounded-full">Видалена</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-ink-muted">
                            <span>{hr.creatorUsername}</span>
                            <span>{REQUEST_STATUS[hr.status]}</span>
                            <span>{new Date(hr.createdAtUtc).toLocaleDateString('uk-UA')}</span>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <button onClick={() => hideReq({ variables: { helpRequestId: hr.id, hide: !hr.isHidden } })}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:border-primary hover:text-primary transition-colors">
                            {hr.isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                            {hr.isHidden ? 'Показати' : 'Приховати'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
