import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ThumbsUp, ChevronLeft, ChevronRight, Ban, CheckCircle } from 'lucide-react'
import { GET_MY_REQUESTS, GET_ASSIGNEE_REQUESTS, CHANGE_HELP_REQUEST_STATUS, CANCEL_RESPONSE, GET_PROFILE, RESIGN_AS_EXECUTOR, SOFT_DELETE_HELP_REQUEST } from '../../api/queries'
import type { HelpRequestsPageData, ChangeHelpRequestStatusData, CancelResponseData, ResignAsExecutorData, SoftDeleteHelpRequestData } from '../../api/types'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { PageSpinner } from '../../components/Spinner'
import RequestCard from '../requests/RequestCard'
import Button from '../../components/ui/Button'
import Modal from '../../components/Modal'
import ReasonModal from '../../components/ReasonModal'

const PAGE_SIZE = 5

interface ProfileRequestsProps {
    userId: string
    isOwn?: boolean
}

type ProfileTab = 'owner' | 'assignee'

export default function ProfileRequests({ userId, isOwn = false }: ProfileRequestsProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch()
    const client = useApolloClient()
    const [activeTab, setActiveTab] = useState<ProfileTab>('owner')
    const [ownerPage, setOwnerPage] = useState(1)
    const [assigneePage, setAssigneePage] = useState(1)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [resignModalOpen, setResignModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'active' | 'history'>('all')

    const statuses = useMemo(() => {
        if (filter === 'active') return ['Moderation', 'Open', 'InProgress']
        if (filter === 'history') return ['Resolved', 'Cancelled', 'Rejected']
        return null
    }, [filter])

    const { data: ownerData, loading: ownerLoading } = useQuery<HelpRequestsPageData>(GET_MY_REQUESTS, {
        variables: { page: ownerPage, pageSize: PAGE_SIZE + 1, creatorId: userId, statuses },
        skip: !userId || activeTab !== 'owner',
        fetchPolicy: 'cache-and-network',
    })

    const { data: assigneeData, loading: assigneeLoading, refetch: assigneeRefetch } = useQuery<HelpRequestsPageData>(GET_ASSIGNEE_REQUESTS, {
        variables: { page: assigneePage, pageSize: PAGE_SIZE + 1, responderId: userId, statuses },
        skip: !userId || activeTab !== 'assignee',
        fetchPolicy: 'cache-and-network',
    })

    const [changeStatus, { loading: changingStatus }] = useMutation<ChangeHelpRequestStatusData>(CHANGE_HELP_REQUEST_STATUS, {
        refetchQueries: [{ query: GET_PROFILE }],
        onCompleted: (data) => {
            const r = data.helpRequest.changeHelpRequestStatus
            if (r.error) {
                dispatch(addToast({ type: 'error', message: r.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Статус змінено!' }))
                client.refetchQueries({ include: [activeTab === 'owner' ? 'GetMyRequests' : 'GetAssigneeRequests'] })
            }
        },
    })

    const [cancelResponse, { loading: cancellingResponse }] = useMutation<CancelResponseData>(CANCEL_RESPONSE, {
        refetchQueries: [{ query: GET_PROFILE }],
        onCompleted: (data) => {
            const r = data.helpRequest.cancelResponse
            if (r.error) {
                dispatch(addToast({ type: 'error', message: r.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Відгук скасовано!' }))
                setCancelModalOpen(false)
                setSelectedRequestId(null)
                assigneeRefetch()
            }
        },
        onError: () => dispatch(addToast({ type: 'error', message: 'Помилка скасування відгуку' })),
    })

    const [resign, { loading: resigning }] = useMutation<ResignAsExecutorData>(RESIGN_AS_EXECUTOR, {
        onCompleted: (data) => {
            const r = data.helpRequest.resignAsExecutor
            if (r.error) {
                dispatch(addToast({ type: 'error', message: r.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Ви припинили допомогу' }))
                setResignModalOpen(false)
                setSelectedRequestId(null)
                assigneeRefetch()
            }
        },
        onError: () => dispatch(addToast({ type: 'error', message: 'Помилка при спробі відмовитись' })),
    })

    const [deleteRequest, { loading: deleting }] = useMutation<SoftDeleteHelpRequestData>(SOFT_DELETE_HELP_REQUEST, {
        refetchQueries: [{ query: GET_PROFILE }],
        onCompleted: (data) => {
            const r = data.helpRequest.softDeleteHelpRequest
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else {
                dispatch(addToast({ type: 'success', message: 'Заявку видалено' }))
                setDeleteModalOpen(false)
                setSelectedRequestId(null)
                client.refetchQueries({ include: ['GetMyRequests'] })
            }
        }
    })

    const ownerItems = ownerData?.helpRequestQuer.helpRequestQuery.items ?? []
    const assigneeItems = assigneeData?.helpRequestQuer.helpRequestQuery.items ?? []
    const currentLoading = activeTab === 'owner' ? ownerLoading : assigneeLoading
    const currentPage = activeTab === 'owner' ? ownerPage : assigneePage
    const setCurrentPage = activeTab === 'owner' ? setOwnerPage : setAssigneePage

    const currentItems = activeTab === 'owner' ? ownerItems : assigneeItems

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-xl">
            <div className="flex bg-surface-muted/30 p-1">
                {([
                    { key: 'owner', label: isOwn ? 'Шукаю допомогу' : 'Шукає допомогу' },
                    { key: 'assignee', label: isOwn ? 'Надаю допомогу' : 'Надає допомогу' }
                ] as const).map(tab => (
                    <button key={tab.key} onClick={() => { setActiveTab(tab.key); setFilter('all'); setCurrentPage(1); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-all rounded-2xl ${activeTab === tab.key
                            ? 'bg-surface text-primary shadow-sm ring-1 ring-border'
                            : 'text-ink-soft hover:text-ink hover:bg-surface-muted'
                            }`}>
                        {tab.key === 'owner' ? <FileText size={16} /> : <ThumbsUp size={16} />}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: activeTab === 'owner' ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: activeTab === 'owner' ? 10 : -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex gap-2 mb-6 bg-surface-muted p-1 rounded-2xl border border-border/50 w-fit">
                            {([
                                { id: 'all', label: 'Всі' },
                                { id: 'active', label: 'Активні' },
                                { id: 'history', label: 'Історія' }
                            ] as const).map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        setFilter(opt.id);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === opt.id
                                        ? 'bg-surface text-primary shadow-sm ring-1 ring-border'
                                        : 'text-ink-soft hover:text-ink hover:bg-surface'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {currentLoading ? (
                            <div className="flex justify-center py-12"><PageSpinner /></div>
                        ) : currentItems.length === 0 ? (
                            <div className="text-center py-16 bg-surface-muted/20 rounded-2xl border border-dashed border-border">
                                <p className="text-sm font-bold text-ink-soft uppercase tracking-widest">
                                    {activeTab === 'owner'
                                        ? (isOwn ? 'Ви ще не створювали запитів' : 'Користувач ще не створював запитів')
                                        : (isOwn ? 'Ви ще не допомагали іншим' : 'Користувач ще не допомагав іншим')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {currentItems.slice(0, PAGE_SIZE).map(item => (
                                    <div key={item.id} className="relative group">
                                        <RequestCard item={item} />

                                        {/* Owner controls - visible only to owner */}
                                        {isOwn && activeTab === 'owner' && Number(item.status) === 2 && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        changeStatus({ variables: { helpRequestId: item.id, status: 'RESOLVED' } });
                                                    }}
                                                    disabled={changingStatus}
                                                    className="shadow-lg py-1 px-3 h-auto text-[10px]"
                                                >
                                                    <CheckCircle size={12} className="mr-1" />
                                                    Виконано
                                                </Button>
                                            </div>
                                        )}

                                        {isOwn && activeTab === 'owner' && Number(item.status) === 1 && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        navigate(`/requests/${item.id}/edit`);
                                                    }}
                                                    className="shadow-lg py-1 px-3 h-auto text-[10px] bg-surface border border-border hover:bg-primary/5 hover:text-primary transition-all"
                                                >
                                                    Редагувати
                                                </Button>
                                            </div>
                                        )}

                                        {isOwn && activeTab === 'owner' && Number(item.status) === 0 && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <Button
                                                    variant="error"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedRequestId(item.id);
                                                        setDeleteModalOpen(true);
                                                    }}
                                                    disabled={deleting}
                                                    className="shadow-lg py-1 px-3 h-auto text-[10px]"
                                                >
                                                    <Ban size={12} className="mr-1" />
                                                    Видалити
                                                </Button>
                                            </div>
                                        )}

                                        {/* Assignee controls - visible only to owner */}
                                        {isOwn && activeTab === 'assignee' && Number(item.status) === 1 && (
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedRequestId(item.id);
                                                        setCancelModalOpen(true);
                                                    }}
                                                    disabled={cancellingResponse}
                                                    className="shadow-lg py-1 px-3 h-auto text-[10px] bg-surface hover:bg-error/10 hover:text-error hover:border-error/30"
                                                >
                                                    <Ban size={12} className="mr-1" />
                                                    Скасувати відгук
                                                </Button>
                                            </div>
                                        )}

                                        {isOwn && activeTab === 'assignee' && Number(item.status) === 2 && (
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedRequestId(item.id);
                                                        setResignModalOpen(true);
                                                    }}
                                                    disabled={resigning}
                                                    className="shadow-lg py-1 px-3 h-auto text-[10px] text-error hover:bg-error/5"
                                                >
                                                    <Ban size={12} className="mr-1" />
                                                    Відмовитись
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {(currentPage > 1 || currentItems.length > PAGE_SIZE) && (
                                    <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-border">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft size={16} />
                                        </Button>
                                        <span className="text-xs font-black text-ink-soft uppercase tracking-widest">Сторінка {currentPage}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            disabled={currentItems.length <= PAGE_SIZE}
                                        >
                                            <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Cancel Response Modal */}
            {isOwn && (
                <Modal isOpen={cancelModalOpen} onClose={() => { if (!cancellingResponse) setCancelModalOpen(false) }} title="Скасувати відгук">
                    <div className="space-y-6 p-2">
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex gap-3">
                            <Ban className="text-primary shrink-0" size={20} />
                            <div>
                                <p className="text-sm font-bold text-ink">Ви впевнені?</p>
                                <p className="text-xs text-ink-soft mt-1">Ваша пропозиція допомоги буде видалена, і ви зможете відгукнутися на іншу заявку.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setCancelModalOpen(false)} disabled={cancellingResponse}>Назад</Button>
                            <Button
                                variant="error"
                                className="flex-1"
                                disabled={cancellingResponse}
                                onClick={() => selectedRequestId && cancelResponse({ variables: { helpRequestId: selectedRequestId } })}
                            >
                                {cancellingResponse ? 'Скасування...' : 'Так, скасувати'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            <ReasonModal
                isOpen={resignModalOpen}
                onClose={() => setResignModalOpen(false)}
                onConfirm={(reason) => selectedRequestId && resign({ variables: { helpRequestId: selectedRequestId, reason } })}
                title="Відмова від виконання"
                description="Ви впевнені, що хочете припинити допомогу? Будь ласка, вкажіть причину для власника заявки."
                confirmText="Припинити допомогу"
                confirmVariant="error"
                isLoading={resigning}
            />

            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Видалити заявку">
                <div className="space-y-6 p-2">
                    <div className="bg-error/10 p-4 rounded-xl border border-error/20 flex gap-3">
                        <Ban className="text-error shrink-0" size={20} />
                        <p className="text-sm text-error font-medium leading-relaxed">
                            Ви впевнені, що хочете видалити цю заявку? Вона ще не пройшла модерацію, але ви можете видалити її зараз.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)}>Скасувати</Button>
                        <Button variant="error" className="flex-1" onClick={() => selectedRequestId && deleteRequest({ variables: { helpRequestId: selectedRequestId } })} disabled={deleting}>
                            {deleting ? 'Видалення...' : 'Видалити'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
