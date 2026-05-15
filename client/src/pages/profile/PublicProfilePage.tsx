import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { CheckCircle, Shield, Phone, AlertCircle, ChevronLeft, Calendar, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { GET_PUBLIC_PROFILE, GET_USER_REVIEWS_PUBLIC } from '../../api/queries'
import type { PublicProfileData, GetUserReviewsData } from '../../api/types'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { PageSpinner } from '../../components/Spinner'
import LeaveComplaintModal from '../../features/requests/components/LeaveComplaintModal'
import ProfileReputation from '../../features/profile/components/ProfileReputation'
import ProfileReviews from '../../features/profile/components/ProfileReviews'
import ProfileStatsCards from '../../features/profile/components/ProfileStatsCards'
import ProfileRequests from '../../features/profile/components/ProfileRequests'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import SocialLink from '../../components/ui/SocialLink'

function formatLastActivity(dateStr: string | null | undefined) {
    if (!dateStr) return 'невідомо'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'сьогодні'
    if (diffDays === 1) return 'вчора'
    if (diffDays < 7) return `${diffDays} дн. тому`
    
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
}

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

    const isOnline = profile.lastActivityAtUtc && (new Date().getTime() - new Date(profile.lastActivityAtUtc).getTime()) < 10 * 60 * 1000

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
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center gap-2 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                    <Calendar size={12} />
                                    На платформі з {new Date(profile.registeredAtUtc).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-ink-soft opacity-40'}`} />
                                    {isOnline ? <span className="text-success">В мережі</span> : `Активність: ${formatLastActivity(profile.lastActivityAtUtc)}`}
                                </div>
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
                <div className="mt-10 pt-8 border-t border-border">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            {profile.phoneNumber && (
                                <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-2xl border border-border shadow-inner">
                                    <Phone size={14} className="text-ink-soft" />
                                    <span className="text-sm font-bold text-ink">{profile.phoneNumber}</span>
                                </div>
                            )}
                            {profile.socialLinks && (
                                <div className="flex items-center gap-3 p-1.5 bg-surface-muted rounded-2xl border border-border shadow-inner">
                                    <SocialLink url={profile.socialLinks} className="w-full justify-start bg-transparent border-none p-1.5" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2 px-1">Статистика активності</h2>
                <ProfileStatsCards 
                    totalRequests={profile.totalRequests}
                    completedRequests={profile.completedRequests}
                    helpedRequests={profile.helpedRequests}
                    rejectedRequests={profile.rejectedRequests}
                />
            </div>

            {/* Репутація та відгуки */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <ProfileReputation 
                        positiveCount={positiveCount}
                        negativeCount={negativeCount}
                    />
                </div>

                <div className="lg:col-span-3">
                    <ProfileReviews reviews={reviews} />
                </div>
            </div>

            {/* Заявки користувача */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2 px-1">Активність</h2>
                <ProfileRequests userId={profile.id} isOwn={isOwn} />
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
