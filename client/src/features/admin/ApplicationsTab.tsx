import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Shield, FileText, Calendar } from 'lucide-react'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { REVIEW_VOLUNTEER_APPLICATION } from '../../api/queries'
import type { VolunteerApplicationItem, ApiError } from '../../api/types'
import { PageSpinner } from '../../components/Spinner'
import Card from '../../components/ui/Card'
import UserLink from '../../components/ui/UserLink'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/Modal'
import { formatDateTime } from '../../hooks/useDateTime'
import { motion, AnimatePresence } from 'framer-motion'

const VOLUNTEER_STATUS_CONFIG: Record<number, { label: string; variant: string }> = {
    0: { label: 'Очікує', variant: 'warning' },
    1: { label: 'Схвалено', variant: 'success' },
    2: { label: 'Відхилено', variant: 'error' },
}

const getVolunteerDocUrl = (url?: string | null) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    
    // Якщо сервер повертає повний шлях
    if (url.startsWith('uploads') || url.startsWith('/uploads')) {
        const cleanUrl = url.startsWith('/') ? url : `/${url}`
        return `${import.meta.env.VITE_API_BASE_URL}${cleanUrl}`
    }
    
    // Якщо сервер повертає лише ім'я файлу
    return `${import.meta.env.VITE_API_BASE_URL}/uploads/volunteer-documents/${url}`
}

export interface ApplicationsTabProps {
    items: VolunteerApplicationItem[]
    loading: boolean
    onRefresh: () => void
}

export default function ApplicationsTab({ items, loading, onRefresh }: ApplicationsTabProps) {
    const dispatch = useAppDispatch()
    const [reviewModal, setReviewModal] = useState<{ id: string; approve: boolean } | null>(null)
    const [comment, setComment] = useState('')
    const [previewImage, setPreviewImage] = useState<string | null>(null)

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
                            <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-ink-soft shrink-0 shadow-inner overflow-hidden border border-border">
                                {app.documentImageUrl ? (
                                    <img 
                                        src={getVolunteerDocUrl(app.documentImageUrl)!} 
                                        alt="Document" 
                                        className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                        onClick={() => setPreviewImage(app.documentImageUrl!)}
                                    />
                                ) : (
                                    <FileText size={24} />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <UserLink userId={app.userId} username={app.username} className="font-black text-xl text-ink leading-none hover:text-primary transition-colors" />
                                    <Badge variant={(VOLUNTEER_STATUS_CONFIG[app.status]?.variant as 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline') || 'default'}>
                                        {VOLUNTEER_STATUS_CONFIG[app.status]?.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {formatDateTime(app.submittedAtUtc)}
                                    </span>
                                    {app.organizationName && (
                                        <>
                                            <span className="w-1 h-1 bg-border rounded-full" />
                                            <span>{app.organizationName}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
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
                                    <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Опис діяльності</p>
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

            {/* Image Preview Modal */}
            <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="Перегляд документа" maxWidth="max-w-4xl">
                <div className="p-1 flex justify-center bg-surface-muted/30 rounded-2xl overflow-hidden border border-border">
                    <img 
                        src={getVolunteerDocUrl(previewImage)!} 
                        alt="Document Large" 
                        className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-xl"
                    />
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => setPreviewImage(null)}>Закрити</Button>
                </div>
            </Modal>
        </div>
    )
}
