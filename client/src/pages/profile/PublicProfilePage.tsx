import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { ThumbsUp, ThumbsDown, CheckCircle, Shield, Phone, Link as LinkIcon, AlertCircle, ChevronLeft, Calendar, FileText, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { GET_PUBLIC_PROFILE, GET_USER_REVIEWS_PUBLIC } from '../../api/queries'
import type { PublicProfileData, GetUserReviewsData } from '../../api/types'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { PageSpinner } from '../../components/Spinner'
import LeaveComplaintModal from '../../features/requests/components/LeaveComplaintModal'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import UserLink from '../../components/ui/UserLink'


export default function PublicProfilePage() {
    const { userId } = useParams<{ userId: string }>()
    const dispatch = useAppDispatch()
    const currentUserId = useAppSelector(s => s.auth.userId)
    const [complaintOpen, setComplaintOpen] = useState(false)

    const { data, loading, error } = useQuery<PublicProfileData>(GET_PUBLIC_PROFILE, {
        variables: { userId },
        skip: !userId,
        fetchPolicy: 'cache-and-network',
    })

    const { data: reviewsData } = useQuery<GetUserReviewsData>(GET_USER_REVIEWS_PUBLIC, {
        variables: { targetUserId: userId },
        skip: !userId,
        fetchPolicy: 'cache-and-network',
    })

    if (loading) return <PageSpinner />

    if (error || data?.userQuery.getPublicProfile.error || !data?.userQuery.getPublicProfile.profile) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto py-20 text-center"
            >
                <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-black text-ink mb-2" style={{ fontFamily: 'Jua, sans-serif' }}>Упс!</h2>
                <p className="text-ink-soft font-medium mb-8">Користувача не знайдено або він видалив свій профіль.</p>
                <Link to="/requests">
                    <Button variant="outline" size="sm">
                        <ChevronLeft size={16} className="mr-2" />
                        Повернутись до списку
                    </Button>
                </Link>
            </motion.div>
        )
    }

    const profile = data.userQuery.getPublicProfile.profile
    const reviews = reviewsData?.userQuery.getUserReviews.reviews ?? []
    const isOwn = currentUserId === profile.id
    const positiveCount = reviews.filter(r => r.isPositive).length  
    const negativeCount = reviews.filter(r => !r.isPositive).length

    const handleCopyId = () => {
        if (!profile) return
        navigator.clipboard.writeText(profile.id.slice(-6))
        dispatch(addToast({ type: 'success', message: 'ID скопійовано' }))
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto space-y-8 pb-20"
        >
            {/* Назад */}
            <Link to="/requests" className="inline-flex items-center gap-2 text-[10px] font-black text-ink-soft uppercase tracking-widest hover:text-primary transition-colors">
                <ChevronLeft size={14} /> Назад до списку
            </Link>

            {/* Основна інформація */}
            <Card padding="lg" className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full -z-10" />
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-surface-muted border border-border flex items-center justify-center text-ink-soft shadow-inner shrink-0">
                            <User size={32} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>
                                    {profile.username}
                                    <button 
                                        onClick={handleCopyId}
                                        className="ml-2 text-xs font-medium text-ink-soft opacity-60 hover:opacity-100 hover:text-primary transition-all"
                                        title="Копіювати повний ID"
                                    >
                                        #{profile.id.slice(-6)}
                                    </button>
                                </h1>
                                {profile.role === 0 && <Badge variant="info" size="sm">Адміністратор</Badge>}
                                {profile.role === 2 && <Badge variant="success" size="sm">Волонтер</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                <Calendar size={12} />
                                На платформі з {new Date(profile.registeredAtUtc).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    {!isOwn && currentUserId && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setComplaintOpen(true)}
                            className="text-error border-error/20 hover:bg-error/5"
                        >
                            <AlertCircle size={14} className="mr-2" />
                            Поскаржитись
                        </Button>
                    )}
                </div>

                {/* Контакти та верифікація */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 pt-8 border-t border-border">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-4">Статус та контакти</label>
                        <div className="flex flex-wrap gap-2">
                            {profile.isEmailVerified && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/5 border border-success/10 rounded-full text-[10px] font-black text-success uppercase tracking-widest">
                                    <CheckCircle size={12} />
                                    Email підтверджено
                                </div>
                            )}
                            {profile.role === 2 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-info/5 border border-info/10 rounded-full text-[10px] font-black text-info uppercase tracking-widest">
                                    <Shield size={12} />
                                    Верифікований волонтер
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2 mt-4">
                            {profile.phoneNumber && (
                                <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-2xl border border-border shadow-inner">
                                    <Phone size={14} className="text-ink-soft" />
                                    <span className="text-sm font-bold text-ink">{profile.phoneNumber}</span>
                                </div>
                            )}
                            {profile.socialLinks && (
                                <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-2xl border border-border shadow-inner">
                                    <LinkIcon size={14} className="text-ink-soft" />
                                    <a href={profile.socialLinks} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary underline truncate">
                                        {profile.socialLinks}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-4">Статистика активності</label>
                        <div className="grid grid-cols-2 gap-4">
                            <Card padding="md" className="bg-primary/5 border-primary/10 text-center">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-2">
                                    <FileText size={20} />
                                </div>
                                <p className="text-2xl font-black text-primary">{profile.totalRequests}</p>
                                <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest">Запитів</p>
                            </Card>
                            <Card padding="md" className="bg-success/5 border-success/10 text-center">
                                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto mb-2">
                                    <CheckCircle size={20} />
                                </div>
                                <p className="text-2xl font-black text-success">{profile.completedRequests}</p>
                                <p className="text-[10px] font-black text-success/70 uppercase tracking-widest">Виконано</p>
                            </Card>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Репутація та відгуки */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2 px-1">Репутація</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Card padding="md" className="bg-success/5 border-success/10 text-center shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto mb-2">
                                <ThumbsUp size={20} />
                            </div>
                            <p className="text-2xl font-black text-success">{positiveCount}</p>
                            <p className="text-[10px] font-black text-success/70 uppercase tracking-widest">Позитивних</p>
                        </Card>
                        <Card padding="md" className="bg-error/5 border-error/10 text-center shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error mx-auto mb-2">
                                <ThumbsDown size={20} />
                            </div>
                            <p className="text-2xl font-black text-error">{negativeCount}</p>
                            <p className="text-[10px] font-black text-error/70 uppercase tracking-widest">Негативних</p>
                        </Card>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <h2 className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2 px-1">Відгуки користувачів</h2>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <Card key={review.id} padding="sm" className="bg-surface-muted/50 border-none shadow-sm">
                                    <div className="flex gap-4">
                                        <div className={`mt-1 shrink-0 ${review.isPositive ? 'text-success' : 'text-error'}`}>
                                            {review.isPositive ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <UserLink userId={review.reviewerUserId} username={review.reviewerUsername} className="text-xs font-bold" />
                                                <span className="text-[10px] font-bold text-ink-soft uppercase">{new Date(review.createdAtUtc).toLocaleDateString('uk-UA')}</span>
                                            </div>
                                            {review.comment && <p className="text-sm text-ink leading-relaxed">{review.comment}</p>}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-surface-muted/30 rounded-3xl border border-dashed border-border">
                                <p className="text-xs font-bold text-ink-soft uppercase tracking-widest">Відгуків ще немає</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {!isOwn && currentUserId && (
                <LeaveComplaintModal
                    isOpen={complaintOpen}
                    onClose={() => setComplaintOpen(false)}
                    targetUserId={profile.id}
                    targetUsername={profile.username}
                />
            )}
        </motion.div>
    )
}
