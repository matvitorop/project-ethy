import { useState, lazy, Suspense } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client/react'
import { ArrowLeft, MapPin, Calendar, AlertCircle, Upload, MessageSquare, History, FileText, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    GET_HELP_REQUEST_BY_ID, GET_STAGES, GET_EVENT_LOG, GET_REPORTS,
    CREATE_REPORT, CHANGE_HELP_REQUEST_STATUS,
    SOFT_DELETE_HELP_REQUEST, CANCEL_HELP_REQUEST, RESTORE_HELP_REQUEST,
    GET_HELP_REQUEST_RESPONSES
} from '../../api/queries'
import type {
    HelpRequestDetailData,
    StagesData,
    EventLogData,
    ReportsData,
    CreateReportData,
    ChangeHelpRequestStatusData,
    ApiError,
    HelpRequestResponsesData
} from '../../api/types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { PageSpinner } from '../../components/Spinner'
import Modal from '../../components/Modal'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import UserLink from '../../components/ui/UserLink'
import StagesTimeline from '../../features/requests/components/StagesTimeline'
import EventLogList from '../../features/requests/components/EventLogList'
import RespondModal from '../../features/requests/components/RespondModal'
import CandidatesModal from '../../features/requests/components/CandidatesModal'
import LeaveReviewModal from '../../features/requests/components/LeaveReviewModal'
import LeaveComplaintModal from '../../features/requests/components/LeaveComplaintModal'

const API_BASE_URL = 'http://localhost:5274'

// Lazy load карти щоб не блокувати рендер
const RequestMap = lazy(() => import('../../features/requests/components/RequestMap'))

const STATUS_CONFIG = {
    0: { label: 'Чернетка', variant: 'default' },
    1: { label: 'Відкрита', variant: 'success' },
    2: { label: 'В процесі', variant: 'info' },
    3: { label: 'Виконана', variant: 'outline' },
    4: { label: 'Скасована', variant: 'error' },
} as const

type DetailTab = 'stages' | 'log' | 'report'

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export default function RequestDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const userId = useAppSelector(s => s.auth.userId)
    const [activeTab, setActiveTab] = useState<DetailTab>('stages')
    const [activeImage, setActiveImage] = useState(0)
    const [respondModalOpen, setRespondModalOpen] = useState(false)
    const [candidatesModalOpen, setCandidatesModalOpen] = useState(false)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [complaintModalOpen, setComplaintModalOpen] = useState(false)

    const dispatch = useAppDispatch()

    const { data, loading, error } = useQuery<HelpRequestDetailData>(
        GET_HELP_REQUEST_BY_ID,
        { variables: { id }, fetchPolicy: 'cache-and-network' }
    )

    const [changeStatus, { loading: changingStatus }] = useMutation<ChangeHelpRequestStatusData>(
        CHANGE_HELP_REQUEST_STATUS,
        {
            onCompleted: (data) => {
                const result = data.helpRequest.changeHelpRequestStatus
                if (result.error) {
                    dispatch(addToast({ type: 'error', message: result.error.message }))
                } else {
                    dispatch(addToast({ type: 'success', message: 'Статус змінено!' }))
                    window.location.reload()
                }
            },
            onError: () => dispatch(addToast({ type: 'error', message: 'Помилка зміни статусу' })),
        }
    )

    const [restoreRequest, { loading: restoring }] = useMutation(RESTORE_HELP_REQUEST, {
        onCompleted: () => {
            dispatch(addToast({ type: 'success', message: 'Заявку відновлено' }))
            window.location.reload()
        },
        onError: () => dispatch(addToast({ type: 'error', message: 'Помилка відновлення' })),
    })

    const [softDelete, { loading: deleting }] = useMutation(SOFT_DELETE_HELP_REQUEST, {
        onCompleted: () => {
            dispatch(addToast({ type: 'success', message: 'Заявку видалено' }))
            navigate('/requests')
        },
        onError: () => dispatch(addToast({ type: 'error', message: 'Помилка видалення' })),
    })

    const [cancelRequest, { loading: cancelling }] = useMutation<{ helpRequest: { cancelHelpRequest: { success: boolean; error: ApiError | null } } }>(CANCEL_HELP_REQUEST, {
        onCompleted: (data) => {
            const result = data.helpRequest.cancelHelpRequest
            if (result.error) {
                dispatch(addToast({ type: 'error', message: result.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Заявку скасовано' }))
                setCancelModalOpen(false)
                window.location.reload()
            }
        },
        onError: () => dispatch(addToast({ type: 'error', message: 'Помилка скасування' })),
    })

    const { data: stagesData } = useQuery<StagesData>(
        GET_STAGES,
        { variables: { helpRequestId: id }, fetchPolicy: 'cache-and-network' }
    )

    const { data: logData } = useQuery<EventLogData>(
        GET_EVENT_LOG,
        { variables: { helpRequestId: id }, fetchPolicy: 'cache-and-network' }
    )

    const { data: reportsData, refetch: refetchReports } = useQuery<ReportsData>(GET_REPORTS, {
        variables: { helpRequestId: id },
        fetchPolicy: 'cache-and-network',
        skip: !id,
    })

    const reports = reportsData?.helpRequestQuer.reports.items ?? []

    const { data: responsesData } = useQuery<HelpRequestResponsesData>(
        GET_HELP_REQUEST_RESPONSES,
        { variables: { helpRequestId: id }, skip: !id, fetchPolicy: 'cache-and-network' }
    )

    const pendingCandidatesCount = responsesData?.helpRequestQuer.helpRequestResponses.items?.filter(r => r.status === 0).length ?? 0

    // Mutation створення звіту:
    const [reportComment, setReportComment] = useState('')
    const [reportImage, setReportImage] = useState<string | null>(null)
    const [reportUploading, setReportUploading] = useState(false)

    const [createReport, { loading: creatingReport }] = useMutation<CreateReportData>(
        CREATE_REPORT,
        {
            onCompleted: (data) => {
                const result = data.helpRequest.createReport
                if (result.error) {
                    dispatch(addToast({ type: 'error', message: result.error.message }))
                } else {
                    dispatch(addToast({ type: 'success', message: 'Звіт створено!' }))
                    setReportComment('')
                    setReportImage(null)
                    refetchReports()
                }
            },
            onError: () => dispatch(addToast({ type: 'error', message: 'Помилка створення звіту' })),
        }
    )

    // Завантаження фото для звіту:
    const handleReportImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setReportUploading(true)
        try {
            const formData = new FormData()
            formData.append('files', file, file.name)  // ← 'files' множина

            const res = await fetch(`${API_BASE_URL}/api/files/help-requests`, {  // ← temp endpoint
                method: 'POST',
                credentials: 'include',
                body: formData,
            })
            if (!res.ok) throw new Error('Upload failed')
            const data = await res.json()
            setReportImage(data.imageUrls[0])  // ← повертає масив, беремо перший
        } catch {
            dispatch(addToast({ type: 'error', message: 'Помилка завантаження фото' }))
        } finally {
            setReportUploading(false)
        }
    }

    const [copied, setCopied] = useState(false)

    if (loading) return <PageSpinner />

    if (error || !data?.helpRequestQuer.helpRequestById.item) {
        return (
            <div className="text-center py-20 px-4">
                <div className="bg-error/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} className="text-error" />
                </div>
                <h2 className="text-xl font-bold text-ink mb-2">Заявку не знайдено</h2>
                <p className="text-ink-muted mb-8 max-w-sm mx-auto">Можливо, вона була видалена або посилання невірне.</p>
                <Link to="/requests">
                    <Button variant="outline" size="sm">
                        ← Повернутись до списку
                    </Button>
                </Link>
            </div>
        )
    }

    const hr = data.helpRequestQuer.helpRequestById.item
    const isOwner = userId === hr.creatorId
    const isAssignee = !!hr.assignedUserId && userId === hr.assignedUserId
    const statusConfig = STATUS_CONFIG[hr.status as keyof typeof STATUS_CONFIG]
    const stages = stagesData?.helpRequestQuer.stages.items ?? []
    const events = logData?.helpRequestQuer.eventLog.items ?? []
    const hasLocation = hr.latitude !== null && hr.longitude !== null

    const handleCopyId = () => {
        navigator.clipboard.writeText(hr.id.slice(-6))
        setCopied(true)
        dispatch(addToast({ type: 'success', message: 'ID скопійовано' }))
        setTimeout(() => setCopied(false), 2000)
    }

    const TABS = [
        { key: 'stages', label: 'Етапи', icon: <MessageSquare size={16} />, count: stages.length },
        { key: 'log', label: 'Історія', icon: <History size={16} />, count: events.length },
        { key: 'report', label: 'Звіт', icon: <FileText size={16} />, count: reports.length },
    ]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
        >
            {/* Назад */}
            <Link to="/requests">
                <Button variant="ghost" size="sm" className="-ml-2 mb-6 text-ink-muted">
                    <ArrowLeft size={16} />
                    Назад до списку
                </Button>
            </Link>

            {/* Зображення */}
            {hr.imageUrls.length > 0 && (
                <div className="mb-10">
                    <Card padding="none" className="h-80 md:h-[400px] shadow-lg">
                        <img
                            src={`${API_BASE_URL}${hr.imageUrls[activeImage]}`}
                            alt={hr.title}
                            className="w-full h-full object-cover"
                        />
                    </Card>
                    {hr.imageUrls.length > 1 && (
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                            {hr.imageUrls.map((url, i) => (
                                <button
                                    key={url}
                                    onClick={() => setActiveImage(i)}
                                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={`${API_BASE_URL}${url}`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Заголовок + статус */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        {statusConfig && (
                            <Badge variant={statusConfig.variant as 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'}>
                                {statusConfig.label}
                            </Badge>
                        )}
                        <button 
                            onClick={handleCopyId}
                            className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-lg transition-all ${
                                copied ? 'bg-success/10 text-success' : 'text-ink-soft hover:bg-surface-muted hover:text-primary'
                            }`}
                            title="Натисніть, щоб скопіювати"
                        >
                            #{hr.id.slice(-6)}
                            {copied && <span className="ml-1">✓</span>}
                        </button>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-ink leading-tight"
                        style={{ fontFamily: 'Jua, sans-serif' }}>
                        {hr.title}
                    </h1>
                </div>
            </div>

            {/* Мета */}
            <Card className="mb-8 border-none shadow-none bg-surface-muted/50" padding="md">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary border border-border shadow-sm">
                            <Calendar size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-ink-soft uppercase leading-none mb-1">Створено</p>
                            <p className="text-xs font-bold text-ink">{formatDate(hr.createdAtUtc)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary border border-border shadow-sm">
                            <User size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-ink-soft uppercase leading-none mb-1">Автор</p>
                            <UserLink userId={hr.creatorId} username={hr.creatorUsername} className="text-xs font-bold" />
                        </div>
                    </div>

                    {hr.assignedUsername && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                                🤝
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-ink-soft uppercase leading-none mb-1">Виконавець</p>
                                <UserLink userId={hr.assignedUserId || undefined} username={hr.assignedUsername} className="text-xs font-bold" />
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Основний контент */}
            <div className={`grid gap-8 mb-10 ${hasLocation ? 'md:grid-cols-5' : 'grid-cols-1'}`}>
                {/* Опис */}
                <div className={hasLocation ? 'md:col-span-3' : ''}>
                    <h2 className="text-xs font-black text-ink-soft uppercase tracking-[0.2em] mb-4">
                        Деталі запиту
                    </h2>
                    <p className="text-ink text-lg leading-relaxed whitespace-pre-wrap font-medium">
                        {hr.description}
                    </p>
                </div>

                {/* Карта */}
                {hasLocation && (
                    <div className="md:col-span-2">
                        <h2 className="text-xs font-black text-ink-soft uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <MapPin size={14} />
                            Локація
                        </h2>
                        <Card padding="none" className="h-64 shadow-md overflow-hidden ring-4 ring-surface">
                            <Suspense fallback={
                                <div className="h-full flex items-center justify-center bg-surface-muted">
                                    <PageSpinner />
                                </div>
                            }>
                                <RequestMap
                                    latitude={hr.latitude!}
                                    longitude={hr.longitude!}
                                />
                            </Suspense>
                        </Card>
                    </div>
                )}
            </div>

            {/* Кнопки дій */}
            <div className="flex flex-wrap gap-3 mb-12 p-1 bg-surface-muted rounded-2xl border border-border w-fit shadow-inner">
                {isOwner && (hr.status === 1 || hr.status === 2) && (
                    <>
                        {hr.status === 1 && (
                            <Link to={`/requests/${hr.id}/edit`}>
                                <Button variant="ghost" size="sm">Редагувати</Button>
                            </Link>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(true)} className="text-error hover:bg-error/5">
                            Скасувати
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(true)} className="text-error hover:bg-error/5">
                            Видалити
                        </Button>
                        <Button size="sm" onClick={() => setCandidatesModalOpen(true)} className="relative">
                            Кандидати
                            {pendingCandidatesCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-error text-white text-[10px] rounded-full font-black min-w-[18px] text-center">
                                    {pendingCandidatesCount}
                                </span>
                            )}
                        </Button>
                        {Number(hr.status) === 2 && (
                            <Button variant="success" size="sm" onClick={() => changeStatus({
                                variables: { helpRequestId: hr.id, status: 'RESOLVED' }
                            })} disabled={changingStatus}>
                                Виконано
                            </Button>
                        )}
                    </>
                )}

                {isOwner && hr.status === 4 && (
                    <Button variant="outline" size="sm" onClick={() => restoreRequest({ variables: { helpRequestId: hr.id } })} disabled={restoring}>
                        Відновити заявку
                    </Button>
                )}

                {!isOwner && hr.status === 1 && (
                    <Button size="sm" onClick={() => setRespondModalOpen(true)}>
                        Відгукнутись на допомогу
                    </Button>
                )}

                {isAssignee && hr.status === 3 && (
                    <Button variant="success" size="sm" onClick={() => setReviewModalOpen(true)}>
                        Залишити відгук
                    </Button>
                )}

                {!isOwner && hr.assignedUserId && (
                    <Button variant="ghost" size="sm" onClick={() => setComplaintModalOpen(true)} className="text-ink-soft hover:text-error hover:bg-error/5">
                        Поскаржитись
                    </Button>
                )}
            </div>

            {/* Вкладки — Етапи і Лог */}
            <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-xl mb-20">
                <div className="flex border-b border-border bg-surface-muted/30 p-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as 'stages' | 'log')}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-all rounded-2xl ${activeTab === tab.key
                                ? 'bg-surface text-primary shadow-sm ring-1 ring-border'
                                : 'text-ink-soft hover:text-ink hover:bg-surface-muted'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary text-white' : 'bg-border text-ink-soft'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'stages' && (
                                <StagesTimeline stages={stages} />
                            )}
                            {activeTab === 'log' && (
                                <EventLogList events={events} />
                            )}
                            {activeTab === 'report' && (
                                <div className="space-y-6">
                                    {/* Існуючі звіти */}
                                    {reports.map(report => (
                                        <Card key={report.id} padding="md" className="space-y-4 border-none bg-surface-muted/50">
                                            <p className="text-base text-ink leading-relaxed font-medium">{report.comment}</p>
                                            {report.imageUrl && (
                                                <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                                                    <img
                                                        src={`${API_BASE_URL}/uploads/reports/${report.imageUrl}`}
                                                        alt="Звіт"
                                                        className="w-full max-h-96 object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between pt-2">
                                                <p className="text-xs font-bold text-ink-soft uppercase tracking-widest">
                                                    {formatDate(report.createdAtUtc)}
                                                </p>
                                            </div>
                                        </Card>
                                    ))}

                                    {/* Форма створення звіту */}
                                    {isOwner && hr.status === 3 && (
                                        <Card className="border-2 border-primary/10 bg-primary/5" padding="md">
                                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                                <FileText size={18} />
                                                Створити звіт про виконання
                                            </h3>
                                            <textarea
                                                value={reportComment}
                                                onChange={e => setReportComment(e.target.value)}
                                                placeholder="Напишіть кілька слів про отриману допомогу та результат..."
                                                rows={4}
                                                className="w-full px-5 py-4 bg-surface border border-border rounded-2xl text-base text-ink placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none mb-4 shadow-inner"
                                            />

                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                <label className="flex items-center gap-3 px-5 py-2.5 bg-surface border-2 border-dashed border-border rounded-2xl text-sm font-bold text-ink-muted hover:border-primary hover:text-primary cursor-pointer transition-all shadow-sm">
                                                    <Upload size={18} />
                                                    {reportUploading ? 'Завантаження...' : 'Завантажити фото звіту'}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleReportImageUpload}
                                                        disabled={reportUploading}
                                                    />
                                                </label>

                                                {reportImage && (
                                                    <div className="flex items-center gap-3 bg-success/10 px-4 py-2 rounded-xl border border-success/20">
                                                        <span className="text-xs font-black text-success uppercase">Фото готове</span>
                                                        <button
                                                            onClick={() => setReportImage(null)}
                                                            className="text-xs font-bold text-error hover:underline"
                                                        >
                                                            Видалити
                                                        </button>
                                                    </div>
                                                )}

                                                <Button
                                                    onClick={() => createReport({
                                                        variables: {
                                                            helpRequestId: hr.id,
                                                            comment: reportComment.trim(),
                                                            imageUrl: reportImage,
                                                        }
                                                    })}
                                                    disabled={creatingReport || !reportComment.trim()}
                                                    className="ml-auto min-w-[140px]"
                                                >
                                                    {creatingReport ? 'Надсилання...' : 'Опублікувати'}
                                                </Button>
                                            </div>
                                        </Card>
                                    )}

                                    {reports.length === 0 && !(isOwner && hr.status === 3) && (
                                        <div className="text-center py-16">
                                            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileText size={24} className="text-ink-soft" />
                                            </div>
                                            <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Звітів поки немає</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <RespondModal
                isOpen={respondModalOpen}
                onClose={() => setRespondModalOpen(false)}
                helpRequestId={hr.id}
                onSuccess={() => { }}
            />

            <CandidatesModal
                isOpen={candidatesModalOpen}
                onClose={() => setCandidatesModalOpen(false)}
                helpRequestId={hr.id}
                canAssign={isOwner && hr.status === 1}
                onAssign={() => setCandidatesModalOpen(false)}
            />

            <Modal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                title="Скасувати заявку"
            >
                <div className="space-y-5 p-2">
                    <p className="text-sm text-ink-muted">Ви впевнені, що хочете скасувати цю заявку? Будь ласка, вкажіть причину.</p>
                    <textarea
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                        placeholder="Вкажіть причину скасування..."
                        rows={3}
                        className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setCancelModalOpen(false)}>Назад</Button>
                        <Button
                            variant="error"
                            className="flex-1"
                            onClick={() => cancelRequest({
                                variables: { helpRequestId: hr.id, reason: cancelReason.trim() }
                            })}
                            disabled={cancelling || !cancelReason.trim()}
                        >
                            {cancelling ? 'Скасування...' : 'Скасувати'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Видалити заявку"
            >
                <div className="space-y-6 p-2">
                    <div className="bg-error/10 p-4 rounded-xl border border-error/20">
                        <p className="text-sm text-error font-medium">
                            Увага! Цю дію неможливо скасувати. Заявку буде видалено назавжди.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)}>Назад</Button>
                        <Button
                            variant="error"
                            className="flex-1"
                            onClick={() => softDelete({ variables: { helpRequestId: hr.id } })}
                            disabled={deleting}
                        >
                            {deleting ? 'Видалення...' : 'Видалити'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <LeaveReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                helpRequestId={hr.id}
                onSuccess={() => window.location.reload()}
            />

            {hr.assignedUserId && (
                <LeaveComplaintModal
                    isOpen={complaintModalOpen}
                    onClose={() => setComplaintModalOpen(false)}
                    targetUserId={isOwner ? hr.assignedUserId : hr.creatorId}
                    targetUsername={isOwner ? 'виконавця' : 'власника заявки'}
                />
            )}
        </motion.div>
    )
}