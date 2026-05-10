import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Shield, FileText, Flag, Eye, EyeOff, BarChart2, Users, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    GET_VOLUNTEER_APPLICATIONS, GET_COMPLAINTS, GET_ADMIN_HELP_REQUESTS,
    REVIEW_VOLUNTEER_APPLICATION, RESOLVE_COMPLAINT, HIDE_HELP_REQUEST,
    BLOCK_USER, GET_ADMIN_ANALYTICS
} from '../../api/queries'
import type {
    VolunteerApplicationsData, ComplaintsData, AdminHelpRequestsData,
    VolunteerApplicationItem, AdminComplaintItem, AdminHelpRequestItem, ApiError, AdminAnalyticsData,
    AdminAnalyticsDto
} from '../../api/types'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import Modal from '../../components/Modal'
import { PageSpinner } from '../../components/Spinner'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import UserLink from '../../components/ui/UserLink'
import Badge from '../../components/ui/Badge'

interface ResolveComplaintData {
    admin: { resolveComplaint: { success: boolean; error: ApiError | null } }
}
interface BlockUserData {
    admin: { blockUser: { success: boolean; error: ApiError | null } }
}
interface HideHelpRequestData {
    admin: { hideHelpRequest: { success: boolean; error: ApiError | null } }
}

const REQUEST_STATUS: Record<number, string> = {
    0: 'Чернетка',
    1: 'Відкрита',
    2: 'В процесі',
    3: 'Виконана',
    4: 'Скасована',
}

const STATUS_CONFIG: Record<number, { label: string; variant: string }> = {
    0: { label: 'Очікує', variant: 'warning' },
    1: { label: 'Схвалено', variant: 'success' },
    2: { label: 'Відхилено', variant: 'error' },
}

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'applications' | 'complaints' | 'requests' | 'analytics'>('analytics')

    const { data: apps, loading: appsLoading, refetch: refetchApps } = useQuery<VolunteerApplicationsData>(GET_VOLUNTEER_APPLICATIONS)
    const { data: complaints, loading: compLoading, refetch: refetchComp } = useQuery<ComplaintsData>(GET_COMPLAINTS)
    const { data: requests, loading: reqLoading, refetch: refetchReq } = useQuery<AdminHelpRequestsData>(GET_ADMIN_HELP_REQUESTS)
    const { data: stats, loading: statsLoading } = useQuery<AdminAnalyticsData>(GET_ADMIN_ANALYTICS)

    const tabs = [
        { id: 'analytics', label: 'Аналітика', icon: <BarChart2 size={18} /> },
        { id: 'applications', label: 'Волонтери', icon: <Shield size={18} /> },
        { id: 'complaints', label: 'Скарги', icon: <Flag size={18} /> },
        { id: 'requests', label: 'Заявки', icon: <FileText size={18} /> },
    ]

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-sm">
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>Адмін-панель</h1>
                    <p className="text-xs font-bold text-ink-soft uppercase tracking-widest mt-1">Керування платформою Ethy</p>
                </div>
            </div>

            {/* Таби */}
            <div className="flex flex-wrap gap-2 mb-10 bg-surface-muted/50 p-1.5 rounded-2xl border border-border/50">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'applications' | 'complaints' | 'requests' | 'analytics')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-surface text-primary shadow-sm ring-1 ring-border'
                            : 'text-ink-soft hover:text-ink hover:bg-surface'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'analytics' && <AnalyticsTab data={stats?.statsQuery.adminAnalytics.data} loading={statsLoading} />}
                    {activeTab === 'applications' && <ApplicationsTab items={apps?.adminQuery.volunteerApplications.items || []} loading={appsLoading} onRefresh={refetchApps} />}
                    {activeTab === 'complaints' && <ComplaintsTab items={complaints?.adminQuery.complaints.items || []} loading={compLoading} onRefresh={refetchComp} />}
                    {activeTab === 'requests' && <RequestsTab items={requests?.adminQuery.helpRequests.items || []} loading={reqLoading} onRefresh={refetchReq} />}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

// ===================== ANALYTICS TAB =====================
function AnalyticsTab({ data, loading }: { data?: AdminAnalyticsDto | null; loading: boolean }) {
    if (loading) return <PageSpinner />
    if (!data) return null

    const stats = [
        { label: 'Користувачів', value: data.totalUsers, icon: <Users />, color: 'bg-primary/10 text-primary', trend: '+12%', up: true },
        { label: 'Волонтерів', value: data.totalVolunteers, icon: <Shield />, color: 'bg-success/10 text-success', trend: '+5%', up: true },
        { label: 'Нових запитів', value: data.newRequestsThisWeek, icon: <FileText />, color: 'bg-info/10 text-info', trend: '+15%', up: true },
        { label: 'Скарг', value: data.totalComplaints, icon: <Flag />, color: 'bg-error/10 text-error', trend: '+1', up: false },
    ]

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <Card key={i} padding="md" className="relative overflow-hidden group hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                                {s.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${s.up ? 'text-success' : 'text-error'}`}>
                                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {s.trend}
                            </div>
                        </div>
                        <p className="text-3xl font-black text-ink mb-1">{s.value}</p>
                        <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest">{s.label}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card padding="lg">
                    <h3 className="text-lg font-black text-ink mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Активність платформи
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-surface-muted/30 rounded-3xl border border-dashed border-border">
                        <p className="text-xs font-bold text-ink-soft uppercase tracking-widest">Графік активності (TBD)</p>
                    </div>
                </Card>
                <Card padding="lg">
                    <h3 className="text-lg font-black text-ink mb-6 flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Нові реєстрації
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-surface-muted/30 rounded-3xl border border-dashed border-border">
                        <p className="text-xs font-bold text-ink-soft uppercase tracking-widest">Графік реєстрацій (TBD)</p>
                    </div>
                </Card>
            </div>
        </div>
    )
}

// ===================== APPLICATIONS TAB =====================
function ApplicationsTab({ items, loading, onRefresh }: { items: VolunteerApplicationItem[]; loading: boolean; onRefresh: () => void }) {
    const dispatch = useAppDispatch()
    const [reviewModal, setReviewModal] = useState<{ id: string; approve: boolean } | null>(null)
    const [comment, setComment] = useState('')

    const [review, { loading: reviewing }] = useMutation<{ admin: { reviewVolunteerApplication: { success: boolean; error: ApiError | null } } }>(REVIEW_VOLUNTEER_APPLICATION, {
        onCompleted: (data) => {
            const r = data?.admin.reviewVolunteerApplication
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else {
                dispatch(addToast({ type: 'success', message: 'Заявку розглянуто' }))
                setReviewModal(null)
                setComment('')
                onRefresh()
            }
        },
    })

    if (loading) return <PageSpinner />

    return (
        <div className="space-y-4">
            {items.length === 0 && (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
                    <Shield size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                    <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Нових заявок немає</p>
                </div>
            )}
            {items.map((app: VolunteerApplicationItem) => (
                <Card key={app.id} padding="md" className="hover:border-primary/20 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-ink-soft shrink-0 shadow-inner">
                                <FileText size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-black text-xl text-ink leading-none">{app.username}</span>
                                    <Badge variant={(STATUS_CONFIG[app.status]?.variant as 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline') || 'default'}>
                                        {STATUS_CONFIG[app.status]?.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {new Date(app.submittedAtUtc).toLocaleDateString('uk-UA')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { /* View Profile */ }}>Профіль</Button>
                            {app.status === 0 && (
                                <div className="flex gap-2 ml-4 pl-4 border-l border-border">
                                    <Button variant="success" size="sm" onClick={() => setReviewModal({ id: app.id, approve: true })}>
                                        Схвалити
                                    </Button>
                                    <Button variant="error" size="sm" onClick={() => setReviewModal({ id: app.id, approve: false })}>
                                        Відхилити
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {app.status === 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-6 pt-6 border-t border-border">
                                    <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Супровідний текст</p>
                                    <div className="bg-surface-muted/50 p-4 rounded-2xl border border-border/50 italic text-sm text-ink-muted leading-relaxed">
                                        "{app.activityDescription || 'Без коментаря'}"
                                    </div>
                                    {app.adminComment && (
                                        <div className="mt-4 p-4 bg-error/5 border border-error/10 rounded-2xl">
                                            <p className="text-[10px] font-black text-error uppercase tracking-widest mb-1">Коментар адміна</p>
                                            <p className="text-sm text-error font-medium">{app.adminComment}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            ))}

            <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setComment('') }}
                title={reviewModal?.approve ? 'Схвалити заявку' : 'Відхилити заявку'}>
                <div className="space-y-5 p-2">
                    <p className="text-sm text-ink-muted">
                        {reviewModal?.approve 
                            ? 'Ви збираєтесь надати користувачу статус волонтера. Він зможе брати завдання в роботу.' 
                            : 'Ви відхиляєте заявку. Бажано вказати причину.'}
                    </p>
                    <textarea 
                        value={comment} 
                        onChange={e => setComment(e.target.value)} 
                        rows={3}
                        placeholder="Коментар для користувача..."
                        className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner" 
                    />
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => { setReviewModal(null); setComment('') }}>
                            Скасувати
                        </Button>
                        <Button
                            onClick={() => review({ variables: { applicationId: reviewModal!.id, approve: reviewModal!.approve, comment: comment || null } })}
                            disabled={reviewing}
                            variant={reviewModal?.approve ? 'success' : 'error'}
                            className="flex-1"
                        >
                            {reviewing ? 'Обробка...' : reviewModal?.approve ? 'Підтвердити' : 'Відхилити'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ===================== COMPLAINTS TAB =====================
function ComplaintsTab({ items, loading, onRefresh }: { items: AdminComplaintItem[]; loading: boolean; onRefresh: () => void }) {
    const dispatch = useAppDispatch()
    const [blockModal, setBlockModal] = useState<{ userId: string; username: string } | null>(null)
    const [blockForm, setBlockForm] = useState({ reason: '', hours: '24', adminComment: '' })

    const BLOCK_PRESETS = [
        { label: '1 д', hours: 24 }, { label: '3 д', hours: 72 },
        { label: '7 д', hours: 168 }, { label: '30 д', hours: 720 },
        { label: '∞', hours: 0 },
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
                dispatch(addToast({ type: 'success', message: 'Користувача заблоковано' }))
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
                                        Від: <UserLink userId={c.reporterUserId} username={c.reporterUsername} /> • {new Date(c.createdAtUtc).toLocaleDateString('uk-UA')}
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
                                    <Button size="sm" onClick={() => resolve({ variables: { complaintId: c.id } })}>Розглянуто</Button>
                                    <Button variant="error" size="sm" onClick={() => setBlockModal({ userId: c.targetUserId, username: c.targetUsername })}>Заблокувати</Button>
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
                            onClick={() => blockUser({
                                variables: {
                                    userId: blockModal!.userId,
                                    reason: blockForm.reason,
                                    hours: parseInt(blockForm.hours),
                                    adminComment: blockForm.adminComment
                                }
                            })}
                        >
                            {blocking ? 'Блокування...' : 'Підтвердити'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ===================== REQUESTS TAB =====================
function RequestsTab({ items, loading, onRefresh }: { items: AdminHelpRequestItem[]; loading: boolean; onRefresh: () => void }) {
    const dispatch = useAppDispatch()
    const [hideReq] = useMutation<HideHelpRequestData>(HIDE_HELP_REQUEST, {
        onCompleted: (data) => {
            const r = data.admin.hideHelpRequest
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else { dispatch(addToast({ type: 'success', message: 'Статус змінено' })); onRefresh() }
        },
    })

    if (loading) return <PageSpinner />

    return (
        <div className="space-y-4">
            {items.length === 0 && (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
                    <FileText size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                    <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Запитів немає</p>
                </div>
            )}
            {items.map((hr: AdminHelpRequestItem) => (
                <Card key={hr.id} padding="sm" className={hr.isHidden ? 'opacity-60 grayscale-[0.5]' : ''}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-bold text-ink truncate text-base">{hr.title}</span>
                                {hr.isHidden && <Badge variant="error">Приховано</Badge>}
                                {hr.isDeleted && <Badge variant="default">Видалено</Badge>}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                <span className="text-primary font-bold">{hr.creatorUsername}</span>
                                <span className="w-1 h-1 bg-border rounded-full" />
                                <span>{REQUEST_STATUS[hr.status]}</span>
                                <span className="w-1 h-1 bg-border rounded-full" />
                                <span>{new Date(hr.createdAtUtc).toLocaleDateString('uk-UA')}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => hideReq({ variables: { helpRequestId: hr.id, hide: !hr.isHidden } })}>
                            {hr.isHidden ? <Eye size={14} className="mr-2" /> : <EyeOff size={14} className="mr-2" />}
                            {hr.isHidden ? 'Показати' : 'Приховати'}
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    )
}
