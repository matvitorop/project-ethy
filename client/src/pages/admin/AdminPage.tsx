import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Shield, FileText, Flag, Eye, EyeOff, Check, X, ChevronDown, ChevronUp, BarChart2, Users, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
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
import Badge from '../../components/ui/Badge'
import UserLink from '../../components/ui/UserLink'

type Tab = 'analytics' | 'complaints' | 'requests' | 'volunteers'
const API_BASE_URL = 'http://localhost:5274'
interface AdminActionResult { success: boolean | null; error: ApiError | null }
interface ReviewVolunteerData { admin: { reviewVolunteerApplication: AdminActionResult } }
interface ResolveComplaintData { admin: { resolveComplaint: AdminActionResult } }
interface BlockUserData { admin: { blockUser: AdminActionResult } }
interface HideHelpRequestData { admin: { hideHelpRequest: AdminActionResult } }

const STATUS_CONFIG: Record<number, { label: string; variant: any }> = {
    0: { label: 'Очікує', variant: 'info' },
    1: { label: 'Схвалено', variant: 'success' },
    2: { label: 'Відхилено', variant: 'error' },
}

const REQUEST_STATUS: Record<number, string> = {
    0: 'Чернетка', 1: 'Відкрита', 2: 'В процесі', 3: 'Виконана', 4: 'Скасована'
}

export default function AdminPage() {
    const [tab, setTab] = useState<Tab>('analytics')
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

    const { data: analyticsData, loading: analyticsLoading } =
        useQuery<AdminAnalyticsData>(GET_ADMIN_ANALYTICS, {
            fetchPolicy: 'cache-and-network',
        })

    const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
        { key: 'analytics', label: 'Аналітика', icon: <BarChart2 size={16} /> },
        { key: 'volunteers', label: 'Заявки', icon: <Shield size={16} />, count: appData?.adminQuery.volunteerApplications.items?.length },
        { key: 'complaints', label: 'Скарги', icon: <Flag size={16} />, count: complData?.adminQuery.complaints.items?.length },
        { key: 'requests', label: 'Запити', icon: <FileText size={16} /> },
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>
                        Адмін-панель
                    </h1>
                    <p className="text-sm text-ink-soft font-bold uppercase tracking-widest">Керування платформою</p>
                </div>
            </div>

            <div className="flex gap-1 bg-surface-muted rounded-2xl p-1 border border-border shadow-inner w-fit">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`relative flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all ${
                            tab === t.key 
                                ? 'bg-surface text-primary shadow-sm ring-1 ring-border' 
                                : 'text-ink-soft hover:text-ink hover:bg-surface'
                        }`}>
                        {t.icon}
                        {t.label}
                        {t.count !== undefined && t.count > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-error text-white text-[10px] font-black rounded-full shadow-sm">
                                {t.count}
                            </span>
                        )}
                        {tab === t.key && (
                            <motion.div
                                layoutId="admin-tab-pill"
                                className="absolute inset-0 bg-surface rounded-xl -z-10 shadow-sm"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {tab === 'analytics' && (
                        <AnalyticsTab 
                            data={analyticsData?.statsQuery.adminAnalytics.data ?? null} 
                            loading={analyticsLoading} 
                        />
                    )}
                    {tab === 'volunteers' && (
                        <VolunteersTab 
                            items={appData?.adminQuery.volunteerApplications.items ?? []} 
                            loading={appLoading} 
                            onRefresh={refetchApps} 
                        />
                    )}
                    {tab === 'complaints' && (
                        <ComplaintsTab 
                            items={complData?.adminQuery.complaints.items ?? []} 
                            loading={complLoading} 
                            onRefresh={refetchCompl} 
                        />
                    )}
                    {tab === 'requests' && (
                        <RequestsTab 
                            items={hrData?.adminQuery.helpRequests.items ?? []} 
                            loading={hrLoading} 
                            onRefresh={refetchHR} 
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

// ===================== ANALYTICS TAB =====================
function AnalyticsTab({ data, loading }: { data: AdminAnalyticsDto | null; loading: boolean }) {
    if (loading) return <PageSpinner />
    if (!data) return <div className="text-center py-20 text-ink-muted">Немає даних для аналітики</div>

    const requestTrend = data.newRequestsLastWeek > 0
        ? Math.round((data.newRequestsThisWeek - data.newRequestsLastWeek) / data.newRequestsLastWeek * 100)
        : null

    return (
        <div className="grid gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    label="Запитів за тиждень" 
                    value={data.newRequestsThisWeek} 
                    trend={requestTrend}
                    trendLabel={`минуло: ${data.newRequestsLastWeek}`}
                    icon={<FileText className="text-primary" size={20} />}
                />
                <StatCard 
                    label="Нових юзерів" 
                    value={data.newUsersThisWeek} 
                    icon={<Users className="text-info" size={20} />}
                />
                <StatCard 
                    label="Скарг у черзі" 
                    value={data.pendingComplaints} 
                    variant={data.pendingComplaints > 0 ? 'error' : 'success'}
                    icon={<Flag className={data.pendingComplaints > 0 ? 'text-error' : 'text-success'} size={20} />}
                />
                <StatCard 
                    label="Заблоковано" 
                    value={data.blockedUsers} 
                    variant="error"
                    icon={<Shield className="text-error" size={20} />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Розподіл ролей">
                    <div className="space-y-6 pt-2">
                        <RoleBar
                            label="Користувачі"
                            count={data.totalUsers}
                            total={data.totalUsers + data.totalVolunteers + data.totalAdmins}
                            color="bg-info"
                        />
                        <RoleBar
                            label="Волонтери"
                            count={data.totalVolunteers}
                            total={data.totalUsers + data.totalVolunteers + data.totalAdmins}
                            color="bg-success"
                        />
                        <RoleBar
                            label="Адміністратори"
                            count={data.totalAdmins}
                            total={data.totalUsers + data.totalVolunteers + data.totalAdmins}
                            color="bg-error"
                        />
                    </div>
                </Card>

                <Card title="Швидка статистика">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-muted rounded-2xl border border-border">
                            <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest mb-1">Всього скарг</p>
                            <p className="text-2xl font-black text-ink">{data.totalComplaints}</p>
                        </div>
                        <div className="p-4 bg-surface-muted rounded-2xl border border-border">
                            <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest mb-1">Схвалено волонтерів</p>
                            <p className="text-2xl font-black text-success">{data.totalVolunteers}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ label, value, trend, trendLabel, icon, variant }: any) {
    return (
        <Card padding="md" className="relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2.5 rounded-xl bg-surface-muted border border-border group-hover:bg-surface transition-colors">
                    {icon}
                </div>
                {trend !== null && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? 'text-success' : 'text-error'}`}>
                        {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="text-2xl font-black text-ink">{value}</p>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">{label}</p>
            {trendLabel && <p className="text-[10px] text-ink-soft mt-1">{trendLabel}</p>}
            {variant === 'error' && value > 0 && (
                <div className="absolute top-0 right-0 w-1 h-full bg-error" />
            )}
        </Card>
    )
}

function RoleBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
    const pct = total > 0 ? Math.round(count / total * 100) : 0
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-ink">{label}</span>
                <span className="text-xs font-black text-ink-soft bg-surface-muted px-2 py-0.5 rounded-full">{count} ({pct}%)</span>
            </div>
            <div className="h-3 bg-surface-muted rounded-full overflow-hidden border border-border/50 p-0.5 shadow-inner">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className={`h-full rounded-full ${color} shadow-sm shadow-${color}/20`}
                />
            </div>
        </div>
    )
}

// ===================== VOLUNTEERS TAB =====================
function VolunteersTab({ items, loading, onRefresh }: any) {
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
        <div className="space-y-4">
            {items.length === 0 && (
                <div className="text-center py-20 bg-surface-muted/50 rounded-3xl border border-dashed border-border">
                    <Shield size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                    <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Нових заявок немає</p>
                </div>
            )}
            {items.map((app: any) => (
                <Card key={app.id} padding="none" className="overflow-hidden">
                    <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-surface-muted transition-colors"
                        onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {app.username[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-ink">{app.username}</span>
                                    <Badge variant={STATUS_CONFIG[app.status]?.variant || 'default'}>
                                        {STATUS_CONFIG[app.status]?.label || 'Невідомо'}
                                    </Badge>
                                </div>
                                <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">{app.organizationName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-ink-soft uppercase tracking-widest">
                                {new Date(app.submittedAtUtc).toLocaleDateString('uk-UA')}
                            </span>
                            <div className={`transition-transform duration-300 ${expanded === app.id ? 'rotate-180' : ''}`}>
                                <ChevronDown size={18} className="text-ink-soft" />
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {expanded === app.id && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 pb-6 pt-2 border-t border-border space-y-5">
                                    <div>
                                        <h4 className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2">Опис діяльності</h4>
                                        <p className="text-sm text-ink leading-relaxed font-medium bg-surface-muted p-4 rounded-2xl border border-border">
                                            {app.activityDescription}
                                        </p>
                                    </div>
                                    {app.documentImageUrl && (
                                        <div>
                                            <h4 className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-3">Документ</h4>
                                            <div className="relative group w-fit">
                                                <img
                                                    src={`${API_BASE_URL}/uploads/volunteer-documents/${app.documentImageUrl}`}
                                                    alt="Документ волонтера"
                                                    className="max-h-64 rounded-2xl border border-border shadow-sm cursor-pointer group-hover:ring-4 group-hover:ring-primary/10 transition-all"
                                                />
                                                <a                                          
                                                    href={`${API_BASE_URL}/uploads/volunteer-documents/${app.documentImageUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                                                >
                                                    <Button variant="outline" size="sm" className="bg-surface border-none">Відкрити повністю</Button>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {app.status === 0 && (
                                        <div className="flex gap-3 pt-2">
                                            <Button onClick={() => setReviewModal({ id: app.id, approve: true })}>
                                                <Check size={16} /> Схвалити
                                            </Button>
                                            <Button variant="error" onClick={() => setReviewModal({ id: app.id, approve: false })}>
                                                <X size={16} /> Відхилити
                                            </Button>
                                        </div>
                                    )}
                                    {app.adminComment && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-ink-soft bg-surface-muted px-4 py-2 rounded-xl border border-border">
                                            <Check size={12} />
                                            Коментар адміна: {app.adminComment}
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
function ComplaintsTab({ items, loading, onRefresh }: any) {
    const dispatch = useAppDispatch()
    const [blockModal, setBlockModal] = useState<any>(null)
    const [blockForm, setBlockForm] = useState({ reason: '', hours: '24', adminComment: '' })
    const [resolveModal, setResolveModal] = useState<any>(null)
    const [resolveComment, setResolveComment] = useState('')

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
                await resolve({
                    variables: {
                        complaintId: blockModal!.complaintId,
                        adminComment: blockForm.adminComment || null
                    }
                })
                dispatch(addToast({ type: 'success', message: 'Користувача заблоковано' }))
                setBlockModal(null)
                setBlockForm({ reason: '', hours: '24', adminComment: '' })
                onRefresh()
            }
        },
    })

    if (loading) return <PageSpinner />

    return (
        <div className="space-y-4">
            {items.length === 0 && (
                <div className="text-center py-20 bg-surface-muted/50 rounded-3xl border border-dashed border-border">
                    <Flag size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                    <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Скарг немає</p>
                </div>
            )}
            {items.map((c: any) => (
                <Card key={c.id} padding="md" className="border-l-4 border-l-error/30">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-xs font-black text-ink-soft uppercase tracking-widest">
                            <UserLink userId={c.reporterUserId} username={c.reporterUsername} className="text-primary hover:underline" />
                            <span>→</span>
                            <UserLink userId={c.targetUserId} username={c.targetUsername} className="text-error hover:underline" />
                        </div>
                        <span className="text-[10px] font-bold text-ink-soft">
                            {new Date(c.createdAtUtc).toLocaleDateString('uk-UA')}
                        </span>
                    </div>
                    <p className="text-sm text-ink leading-relaxed mb-5 font-medium bg-surface-muted/50 p-4 rounded-2xl border border-border shadow-inner">
                        {c.reason}
                    </p>
                    <div className="flex gap-3 pt-1">
                        <Button size="sm" variant="error" onClick={() => setBlockModal({
                            userId: c.targetUserId,
                            username: c.targetUsername,
                            complaintId: c.id
                        })}>
                            Заблокувати {c.targetUsername}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-ink-soft border border-border" onClick={() => setResolveModal({ complaintId: c.id })}>
                            Проігнорувати / Схвалено
                        </Button>
                    </div>
                </Card>
            ))}

            <Modal isOpen={!!blockModal} onClose={() => setBlockModal(null)} title={`Заблокувати ${blockModal?.username}`}>
                <div className="space-y-5 p-2">
                    <div className="bg-error/10 p-4 rounded-xl border border-error/20 flex gap-3 items-start">
                        <AlertCircle className="text-error shrink-0" size={18} />
                        <p className="text-xs text-error font-medium leading-relaxed">
                            Блокування обмежить доступ користувача до функцій допомоги на обраний період.
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2">Термін</label>
                        <div className="flex flex-wrap gap-2">
                            {BLOCK_PRESETS.map(p => (
                                <button key={p.label} onClick={() => setBlockForm(f => ({ ...f, hours: String(p.hours) }))}
                                    className={`px-4 py-2 text-xs font-black rounded-xl border transition-all ${
                                        blockForm.hours === String(p.hours) 
                                            ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20' 
                                            : 'bg-surface-muted border-border text-ink hover:border-primary'
                                    }`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2">Причина для адміна</label>
                        <textarea value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                            rows={2} placeholder="Чому блокуємо..."
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner" />
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setBlockModal(null)}>Скасувати</Button>
                        <Button variant="error" className="flex-1" onClick={() => {
                            const hours = parseInt(blockForm.hours)
                            const blockedUntil = hours > 0 ? new Date(Date.now() + hours * 3600000).toISOString() : null
                            blockUser({ variables: { targetUserId: blockModal!.userId, reason: blockForm.reason, blockedUntilUtc: blockedUntil } })
                        }} disabled={blocking || !blockForm.reason.trim()}>
                            {blocking ? '...' : 'Заблокувати'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ===================== REQUESTS TAB =====================
function RequestsTab({ items, loading, onRefresh }: any) {
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
        <div className="space-y-3">
            {items.length === 0 && (
                <div className="text-center py-20 bg-surface-muted/50 rounded-3xl border border-dashed border-border">
                    <FileText size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                    <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Запитів немає</p>
                </div>
            )}
            {items.map((hr: any) => (
                <Card key={hr.id} padding="sm" className={hr.isHidden ? 'opacity-60 grayscale-[0.5]' : ''}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-bold text-ink truncate text-base">{hr.title}</span>
                                {hr.isHidden && <Badge variant="error">Приховано</Badge>}
                                {hr.isDeleted && <Badge variant="default">Видалено</Badge>}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                <UserLink userId={hr.creatorId} username={hr.creatorUsername} className="hover:text-primary" />
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
