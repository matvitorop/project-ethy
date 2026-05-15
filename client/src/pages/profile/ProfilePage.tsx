import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { Shield, Pencil, Check, X, Eye, EyeOff, ThumbsUp, Phone, Link as LinkIcon, Upload, Calendar, Mail, User, Lock, Trash2, FileText, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { 
    GET_PROFILE, UPDATE_USERNAME, CHANGE_PASSWORD, DELETE_ACCOUNT, 
    UPDATE_PROFILE, GET_USER_REVIEWS, GET_MY_VOLUNTEER_APPLICATION, SUBMIT_VOLUNTEER_APPLICATION 
} from '../../api/queries'
import type { 
    ProfileData, UpdateUsernameData, ChangePasswordData, DeleteAccountData, 
    UpdateProfileData, GetUserReviewsData, MyVolunteerApplicationData, SubmitVolunteerApplicationData 
} from '../../api/types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { setAuth, clearAuth } from '../../store/authSlice'
import { PageSpinner } from '../../components/Spinner'
import Modal from '../../components/Modal'
import ProfileReputation from '../../features/profile/components/ProfileReputation'
import ProfileReviews from '../../features/profile/components/ProfileReviews'
import ProfileStatsCards from '../../features/profile/components/ProfileStatsCards'
import ProfileRequests from '../../features/profile/components/ProfileRequests'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import SocialLink from '../../components/ui/SocialLink'

const API_BASE_URL = 'http://localhost:5274'

export default function ProfilePage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const userId = useAppSelector(s => s.auth.userId)
    const role = useAppSelector(s => s.auth.role)

    const [editingUsername, setEditingUsername] = useState(false)
    const [newUsername, setNewUsername] = useState('')
    const [editingPassword, setEditingPassword] = useState(false)
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' })
    const [showPasswords, setShowPasswords] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [editingContacts, setEditingContacts] = useState(false)
    const [contactForm, setContactForm] = useState({ phoneNumber: '', socialLinks: '' })

    // Volunteer modal
    const [volModalOpen, setVolModalOpen] = useState(false)
    const [volUploading, setVolUploading] = useState(false)
    const [volForm, setVolForm] = useState({ organizationName: '', activityDescription: '', documentImageUrl: '' })

    const { data: profileData, loading: profileLoading } = useQuery<ProfileData>(GET_PROFILE, {
        fetchPolicy: 'cache-and-network',
    })

    const { data: reviewsData } = useQuery<GetUserReviewsData>(GET_USER_REVIEWS, {
        variables: { targetUserId: userId },
        skip: !userId,
        fetchPolicy: 'cache-and-network',
    })

    const { data: volAppData, refetch: refetchVolApp } = useQuery<MyVolunteerApplicationData>(GET_MY_VOLUNTEER_APPLICATION, {
        fetchPolicy: 'cache-and-network',
        skip: role === 'Volunteer' || role === 'Admin' || !userId,
    })

    const [submitApplication, { loading: submitting }] = useMutation<SubmitVolunteerApplicationData>(SUBMIT_VOLUNTEER_APPLICATION, {
        onCompleted: (data) => {
            const r = data.user.submitVolunteerApplication
            if (r.error) {
                dispatch(addToast({ type: 'error', message: r.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Заявку подано на розгляд!' }))
                setVolForm({ organizationName: '', activityDescription: '', documentImageUrl: '' })
                setVolModalOpen(false)
                refetchVolApp()
            }
        },
    })

    const [updateUsername, { loading: updatingUsername }] = useMutation<UpdateUsernameData>(UPDATE_USERNAME, {
        onCompleted: (data) => {
            const result = data.auth.updateUsername
            if (result.error) {
                dispatch(addToast({ type: 'error', message: result.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: "Ім'я змінено!" }))
                dispatch(setAuth({ userId: userId ?? '', username: newUsername, email: profile?.email ?? '' }))
                setEditingUsername(false)
            }
        },
    })

    const [changePassword, { loading: changingPassword }] = useMutation<ChangePasswordData>(CHANGE_PASSWORD, {
        onCompleted: (data) => {
            const result = data.auth.changePassword
            if (result.error) {
                dispatch(addToast({ type: 'error', message: result.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Пароль змінено!' }))
                setEditingPassword(false)
                setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' })
            }
        },
    })

    const [deleteAccount, { loading: deletingAccount }] = useMutation<DeleteAccountData>(DELETE_ACCOUNT, {
        onCompleted: (data) => {
            const result = data.auth.deleteAccount
            if (result.error) {
                dispatch(addToast({ type: 'error', message: result.error.message }))
                setDeleteModalOpen(false)
            } else {
                dispatch(clearAuth())
                navigate('/login')
                dispatch(addToast({ type: 'success', message: 'Акаунт видалено' }))
            }
        },
    })

    const [updateProfile, { loading: updatingProfile }] = useMutation<UpdateProfileData>(UPDATE_PROFILE, {
        refetchQueries: [{ query: GET_PROFILE }],
        onCompleted: (data) => {
            const result = data.user.updateProfile
            if (result.error) {
                dispatch(addToast({ type: 'error', message: result.error.message }))
            } else {
                dispatch(addToast({ type: 'success', message: 'Контакти збережено!' }))
                setEditingContacts(false)
            }
        },
    })

    const handleUpdateContacts = () => {
        let links = contactForm.socialLinks.trim()
        const forbidden = ["<script", "javascript:", "onerror", "onclick", "onload", "href=", "src="]
        if (forbidden.some(f => links.toLowerCase().includes(f))) {
            dispatch(addToast({ type: 'error', message: 'Недопустимий формат посилання' }))
            return
        }
        if (links.startsWith('@') && !links.includes(' ')) {
            links = `https://t.me/${links.substring(1)}`
        }
        updateProfile({ variables: { ...contactForm, socialLinks: links } })
    }

    const handleVolDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setVolUploading(true)
        try {
            const formData = new FormData()
            formData.append('files', file, file.name)
            const res = await fetch(`${API_BASE_URL}/api/files/help-requests`, {
                method: 'POST', credentials: 'include', body: formData,
            })
            if (!res.ok) throw new Error()
            const data = await res.json()
            setVolForm(f => ({ ...f, documentImageUrl: data.imageUrls[0] }))
        } catch {
            dispatch(addToast({ type: 'error', message: 'Помилка завантаження' }))
        } finally {
            setVolUploading(false)
        }
    }

    if (profileLoading) return <PageSpinner />

    const profile = profileData?.userQuery.profile.profile
    if (!profile) return <div className="text-center py-20 text-ink-muted">Профіль не знайдено</div>

    const reviews = reviewsData?.userQuery.getUserReviews.reviews ?? []
    const positiveCount = reviews.filter(r => r.isPositive).length
    const negativeCount = reviews.filter(r => !r.isPositive).length
    const volApp = volAppData?.userQuery.getMyVolunteerApplication.application

    const handleCopyId = () => {
        if (!userId) return
        navigator.clipboard.writeText(userId.slice(-6))
        dispatch(addToast({ type: 'success', message: 'ID скопійовано' }))
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto space-y-10"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>
                        Мій Профіль
                        <button
                            onClick={handleCopyId}
                            className="ml-2 text-xs font-medium text-ink-soft opacity-60 hover:opacity-100 hover:text-primary transition-all"
                            title="Копіювати повний ID"
                        >
                            #{userId?.slice(-6)}
                        </button>
                    </h1>
                    <p className="text-xs font-bold text-ink-soft uppercase tracking-widest mt-1">Особисті налаштування</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-ink-soft uppercase tracking-widest mt-2">
                        <Calendar size={12} className="text-primary" />
                        На платформі з {new Date(profile.registeredAtUtc).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
                {profile.role === 'Volunteer' && (
                    <Badge variant="success" className="py-2 px-4 text-sm">
                        <Shield size={14} className="mr-2" />
                        Волонтер
                    </Badge>
                )}
                {profile.role === 'Admin' && (
                    <Badge variant="info" className="py-2 px-4 text-sm">
                        <Shield size={14} className="mr-2" />
                        Адміністратор
                    </Badge>
                )}
            </div>

            {/* Основна інформація */}
            <Card padding="lg" className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />

                <div className="space-y-8">
                    {/* Username Edit */}
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-3">Ім'я користувача</label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
                                <input
                                    type="text"
                                    value={editingUsername ? newUsername : profile.username}
                                    onChange={e => setNewUsername(e.target.value)}
                                    disabled={!editingUsername}
                                    className="w-full pl-11 pr-4 py-3 bg-surface-muted border border-border rounded-2xl text-ink font-bold disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                />
                            </div>
                            {editingUsername ? (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => { if (!newUsername.trim()) return; updateUsername({ variables: { newUsername: newUsername.trim() } }) }}
                                        disabled={updatingUsername || !newUsername.trim()}>
                                        <Check size={16} />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => { setEditingUsername(false); setNewUsername('') }}>
                                        <X size={16} />
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => { setEditingUsername(true); setNewUsername(profile.username) }}>
                                    <Pencil size={16} />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Email (Readonly) */}
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-3">Email адреса</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
                            <input type="email" value={profile.email} disabled
                                className="w-full pl-11 pr-4 py-3 bg-surface-muted border border-border rounded-2xl text-ink font-bold opacity-60" />
                            {profile.isEmailVerified && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Badge variant="success">Підтверджено</Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Пароль */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em]">Безпека</label>
                                {!editingPassword && (
                                    <button onClick={() => setEditingPassword(true)}
                                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                        Змінити пароль
                                    </button>
                                )}
                            </div>
                            {editingPassword ? (
                                <Card padding="md" className="space-y-3 bg-surface-muted border-primary/20">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" size={14} />
                                        <input type={showPasswords ? 'text' : 'password'} value={passwordForm.oldPassword}
                                            onChange={e => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
                                            placeholder="Поточний пароль"
                                            className="w-full pl-9 pr-10 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                                        <button type="button" onClick={() => setShowPasswords(p => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink">
                                            {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <input type={showPasswords ? 'text' : 'password'} value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                                        placeholder="Новий пароль"
                                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                                    <input type={showPasswords ? 'text' : 'password'} value={passwordForm.confirmNewPassword}
                                        onChange={e => setPasswordForm(f => ({ ...f, confirmNewPassword: e.target.value }))}
                                        placeholder="Підтвердіть новий пароль"
                                        className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                                    <div className="flex gap-2 pt-1">
                                        <Button size="sm" className="flex-1" onClick={() => changePassword({ variables: passwordForm })}
                                            disabled={changingPassword || !passwordForm.oldPassword || !passwordForm.newPassword}>
                                            Зберегти
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => { setEditingPassword(false); setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' }) }}>
                                            Скасувати
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <div className="relative opacity-60">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
                                    <input type="password" value="••••••••" disabled
                                        className="w-full pl-11 pr-4 py-3 bg-surface-muted border border-border rounded-2xl text-ink shadow-inner" />
                                </div>
                            )}
                        </div>

                        {/* Контакти */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em]">Контакти</label>
                                {!editingContacts && (
                                    <button onClick={() => { setEditingContacts(true); setContactForm({ phoneNumber: profile.phoneNumber ?? '', socialLinks: profile.socialLinks ?? '' }) }}
                                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                        Редагувати
                                    </button>
                                )}
                            </div>
                            {editingContacts ? (
                                <Card padding="md" className="space-y-3 bg-surface-muted border-primary/20">
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" size={14} />
                                        <input type="tel" value={contactForm.phoneNumber}
                                            onChange={e => setContactForm(f => ({ ...f, phoneNumber: e.target.value }))}
                                            placeholder="+380..."
                                            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                                    </div>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" size={14} />
                                        <input type="text" value={contactForm.socialLinks}
                                            onChange={e => setContactForm(f => ({ ...f, socialLinks: e.target.value }))}
                                            placeholder="t.me/username або instagram.com/..."
                                            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                                    </div>
                                    {contactForm.socialLinks && (
                                        <div className="px-1">
                                            <SocialLink url={contactForm.socialLinks} />
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-1">
                                        <Button size="sm" className="flex-1" onClick={handleUpdateContacts} disabled={updatingProfile}>
                                            Зберегти
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setEditingContacts(false)}>
                                            Скасувати
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-2xl border border-border shadow-inner">
                                        <Phone size={14} className="text-ink-soft" />
                                        <span className={`text-sm font-bold ${profile.phoneNumber ? 'text-ink' : 'text-ink-soft italic'}`}>
                                            {profile.phoneNumber || 'Номер не вказано'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 p-1.5 bg-surface-muted rounded-2xl border border-border shadow-inner">
                                        <SocialLink url={profile.socialLinks} className="w-full justify-start bg-transparent border-none p-1.5" />
                                        {!profile.socialLinks && (
                                            <>
                                                <LinkIcon size={14} className="ml-1.5 text-ink-soft" />
                                                <span className="text-sm font-bold text-ink-soft italic">Соц. мережі не вказано</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                        <Calendar size={12} />
                        З нами з {new Date(profile.registeredAtUtc).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={() => setDeleteModalOpen(true)} className="flex items-center gap-2 text-[10px] font-black text-error/50 hover:text-error uppercase tracking-widest transition-colors">
                        <Trash2 size={12} />
                        Видалити акаунт
                    </button>
                </div>
            </Card>

            {/* Статистика активності */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2 px-1">Статистика</h2>
                <ProfileStatsCards 
                    totalRequests={profile.totalRequests}
                    completedRequests={profile.completedRequests}
                    helpedRequests={profile.helpedRequests}
                    rejectedRequests={profile.rejectedRequests}
                />
            </div>

            {/* Ліміти (для звичайних користувачів) */}
            {profile.role === 'User' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card padding="md" className="flex items-center justify-between border-primary/10 shadow-sm bg-surface-muted/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-ink-soft uppercase tracking-wider">Активні заявки</p>
                                <p className="text-xl font-black text-ink">{profile.activeRequestsCount} <span className="text-sm font-medium opacity-40">/ 3</span></p>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-ink-soft bg-surface-muted px-2 py-1 rounded-lg uppercase tracking-widest border border-border">Ліміт</div>
                    </Card>
                    <Card padding="md" className="flex items-center justify-between border-primary/10 shadow-sm bg-surface-muted/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <ThumbsUp size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-ink-soft uppercase tracking-wider">Активні відгуки</p>
                                <p className="text-xl font-black text-ink">{profile.activeResponsesCount} <span className="text-sm font-medium opacity-40">/ 1</span></p>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-ink-soft bg-surface-muted px-2 py-1 rounded-lg uppercase tracking-widest border border-border">Ліміт</div>
                    </Card>
                </div>
            )}

            {/* Волонтерський статус */}
            {profile.role !== 'Volunteer' && profile.role !== 'Admin' && (
                <Card className="border-2 border-primary/10 bg-primary/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                <Shield size={28} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>Бажаєте допомагати?</h3>
                                <p className="text-sm text-ink-soft font-medium max-w-sm">
                                    {volApp?.status === 0
                                        ? `Ваша заявка на розгляді. Ми повідомимо вас про результат.`
                                        : volApp?.status === 2
                                            ? `На жаль, вашу попередню заявку було відхилено. Ви можете спробувати ще раз.`
                                            : `Отримайте статус верифікованого волонтера: більше довіри та жодних обмежень на допомогу.`}
                                </p>
                            </div>
                        </div>
                        {volApp?.status !== 0 && (
                            <Button onClick={() => setVolModalOpen(true)} className="whitespace-nowrap shadow-md">
                                Подати заявку
                            </Button>
                        )}
                        {volApp?.status === 0 && (
                            <Badge variant="info" className="py-2 px-4">На розгляді</Badge>
                        )}
                    </div>
                </Card>
            )}

            {/* Репутація та відгуки */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <ProfileReputation 
                        positiveCount={positiveCount}
                        negativeCount={negativeCount}
                    />
                </div>

                <div className="lg:col-span-3">
                    <ProfileReviews reviews={reviews} title="Останні відгуки" />
                </div>
            </div>

            {/* Активність (Заявки) */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2 px-1">Активність</h2>
                <ProfileRequests userId={userId ?? ''} isOwn={true} />
            </div>

            {/* Модалки */}
            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Видалити акаунт">
                <div className="space-y-6 p-2">
                    <div className="bg-error/10 p-4 rounded-xl border border-error/20 flex gap-3">
                        <AlertCircle className="text-error shrink-0" size={20} />
                        <p className="text-sm text-error font-medium leading-relaxed">
                            Ви впевнені що хочете видалити акаунт? Всі ваші дані, запити та репутація будуть видалені назавжди.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)}>Скасувати</Button>
                        <Button variant="error" className="flex-1" onClick={() => deleteAccount()} disabled={deletingAccount}>
                            {deletingAccount ? 'Видалення...' : 'Видалити назавжди'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={volModalOpen} onClose={() => setVolModalOpen(false)} title="Заявка на волонтера">
                <div className="space-y-5 p-2">
                    {volApp?.status === 2 && volApp.adminComment && (
                        <div className="bg-error/5 rounded-xl p-4 border border-error/10 text-xs text-error font-medium flex gap-3">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>Відхилено: {volApp.adminComment}</span>
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2">Назва організації / Ім'я</label>
                        <input
                            value={volForm.organizationName}
                            onChange={e => setVolForm(f => ({ ...f, organizationName: e.target.value }))}
                            placeholder="Наприклад: БФ 'Разом', Незалежний волонтер..."
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-2">Опис діяльності</label>
                        <textarea
                            value={volForm.activityDescription}
                            onChange={e => setVolForm(f => ({ ...f, activityDescription: e.target.value }))}
                            placeholder="Розкажіть про ваш досвід та чим ви займаєтесь..."
                            rows={4}
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                        />
                    </div>
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Важливо</p>
                        <p className="text-xs text-ink-soft font-medium leading-relaxed">
                            Для підтвердження статусу волонтера завантажте фото одного з документів: 
                            <span className="font-bold text-ink"> посвідчення волонтера, офіційну довідку від благодійного фонду або ГО, або інший документ, що засвідчує вашу діяльність.</span>
                        </p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-[0.2em] mb-3">Скан/Фото документа (обов'язково)</label>
                        <div className="flex flex-wrap items-center gap-4">
                            <label className="flex items-center gap-3 px-5 py-2.5 bg-surface border-2 border-dashed border-border rounded-2xl text-xs font-black text-ink-soft hover:border-primary hover:text-primary cursor-pointer transition-all shadow-sm">
                                <Upload size={16} />
                                {volUploading ? 'Завантаження...' : volForm.documentImageUrl ? '✓ Файл додано' : 'Завантажити посвідчення / документ'}
                                <input type="file" accept="image/*" className="hidden" onChange={handleVolDocUpload} disabled={volUploading} />
                            </label>
                            {volForm.documentImageUrl && (
                                <button onClick={() => setVolForm(f => ({ ...f, documentImageUrl: '' }))} className="text-xs font-black text-error uppercase tracking-widest hover:underline">
                                    Видалити
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setVolModalOpen(false)}>Скасувати</Button>
                        <Button
                            className="flex-1"
                            onClick={() => submitApplication({ variables: { ...volForm, documentImageUrl: volForm.documentImageUrl } })}
                            disabled={submitting || !volForm.organizationName.trim() || !volForm.activityDescription.trim() || !volForm.documentImageUrl}
                        >
                            {submitting ? 'Надсилання...' : 'Надіслати заявку'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    )
}
