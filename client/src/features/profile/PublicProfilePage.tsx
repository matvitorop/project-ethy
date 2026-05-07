import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { ThumbsUp, ThumbsDown, CheckCircle, Shield, Phone, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { GET_PUBLIC_PROFILE, GET_USER_REVIEWS_PUBLIC } from '../../api/queries'
import type { PublicProfileData, GetUserReviewsData } from '../../api/types'
import { useAppSelector } from '../../store/hooks'
import { PageSpinner } from '../../components/Spinner'
import LeaveComplaintModal from '../requests/components/LeaveComplaintModal'

const ROLE_LABELS: Record<number, string> = { 0: 'Адміністратор', 1: 'Користувач', 2: 'Волонтер' }
const ROLE_COLORS: Record<number, string> = {
    0: 'bg-error/10 text-error',
    1: 'bg-surface-muted text-ink-muted',
    2: 'bg-success/10 text-success',
}

export default function PublicProfilePage() {
    const { userId } = useParams<{ userId: string }>()
    const currentUserId = useAppSelector(s => s.auth.userId)
    const [complaintOpen, setComplaintOpen] = useState(false)

    const { data, loading, error } = useQuery<PublicProfileData>(GET_PUBLIC_PROFILE, {
        variables: { userId },
        skip: !userId,
        fetchPolicy: 'cache-first',
    })

    const { data: reviewsData } = useQuery<GetUserReviewsData>(GET_USER_REVIEWS_PUBLIC, {
        variables: { targetUserId: userId },
        skip: !userId,
        fetchPolicy: 'cache-first',
    })

    if (loading) return <PageSpinner />

    if (error || data?.userQuery.getPublicProfile.error || !data?.userQuery.getPublicProfile.profile) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center">
                <AlertCircle size={40} className="text-error mx-auto mb-4" />
                <p className="text-ink-muted">Профіль не знайдено</p>
                <Link to="/requests" className="text-primary text-sm mt-2 inline-block hover:underline">
                    ← Повернутись до заявок
                </Link>
            </div>
        )
    }

    const profile = data.userQuery.getPublicProfile.profile
    const reviews = reviewsData?.userQuery.getUserReviews.reviews ?? []
    const isOwn = currentUserId === profile.id
    const positiveCount = reviews.filter(r => r.isPositive).length  
    const negativeCount = reviews.filter(r => !r.isPositive).length

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Назад */}
            <Link to="/requests" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                ← Назад
            </Link>

            {/* Основна інформація */}
            <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-ink"
                                style={{ fontFamily: 'Jua, sans-serif' }}>
                                {profile.username}
                            </h1>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[profile.role]}`}>
                                {ROLE_LABELS[profile.role] ?? 'Користувач'}
                            </span>
                        </div>
                        <p className="text-xs text-ink-muted">
                            На платформі з{' '}
                            {new Date(profile.registeredAtUtc).toLocaleDateString('uk-UA', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </p>
                    </div>

                    {!isOwn && currentUserId && (
                        <button
                            onClick={() => setComplaintOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg text-ink-muted hover:border-error hover:text-error transition-colors"
                        >
                            Поскаржитись
                        </button>
                    )}
                </div>

                {/* Значки */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    {profile.isEmailVerified && (
                        <Badge icon={<CheckCircle size={12} />} label="Email підтверджено" color="text-success" />
                    )}
                    {profile.role === 2 && (
                        <Badge icon={<Shield size={12} />} label="Волонтер" color="text-info" />
                    )}
                    {profile.hasPhone && (
                        <Badge icon={<Phone size={12} />} label="Є телефон" color="text-ink-muted" />
                    )}
                    {profile.hasSocialLinks && (
                        <Badge icon={<LinkIcon size={12} />} label="Є соцмережа" color="text-ink-muted" />
                    )}
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Всього заявок" value={profile.totalRequests} />
                <StatCard label="Виконано" value={profile.completedRequests} />
            </div>

            {/* Репутація */}
            <div className="bg-surface rounded-xl border border-border p-6">
                <h2 className="text-base font-semibold text-ink mb-4"
                    style={{ fontFamily: 'Jua, sans-serif' }}>
                    Репутація
                </h2>
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 flex items-center gap-3 p-3 bg-success/10 rounded-xl border border-success/20">
                        <ThumbsUp size={20} className="text-success" />
                        <div>
                            <p className="text-xl font-bold text-success">{positiveCount}</p>
                            <p className="text-xs text-ink-muted">Позитивних</p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 p-3 bg-error/10 rounded-xl border border-error/20">
                        <ThumbsDown size={20} className="text-error" />
                        <div>
                            <p className="text-xl font-bold text-error">{negativeCount}</p>
                            <p className="text-xs text-ink-muted">Негативних</p>
                        </div>
                    </div>
                </div>

                {reviews.length > 0 ? (
                    <div className="space-y-3">
                        {reviews.map(review => (
                            <div key={review.id} className="flex gap-3 p-3 bg-surface-muted rounded-lg border border-border">
                                <div className={`mt-0.5 shrink-0 ${review.isPositive ? 'text-success' : 'text-error'}`}>
                                    {review.isPositive ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-ink">{review.reviewerUsername}</span>
                                        <span className="text-xs text-ink-soft">
                                            {new Date(review.createdAtUtc).toLocaleDateString('uk-UA')}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-ink-muted">{review.comment}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-ink-soft text-center py-4">Відгуків ще немає</p>
                )}
            </div>

            {!isOwn && currentUserId && (
                <LeaveComplaintModal
                    isOpen={complaintOpen}
                    onClose={() => setComplaintOpen(false)}
                    targetUserId={profile.id}
                    targetUsername={profile.username}
                />
            )}
        </div>
    )
}

function Badge({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-muted border border-border ${color}`}>
            {icon}{label}
        </span>
    )
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-xs text-ink-muted mt-1">{label}</p>
        </div>
    )
}
