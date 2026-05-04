import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Check, X, Eye, EyeOff } from 'lucide-react'
import { GET_PROFILE, UPDATE_USERNAME, CHANGE_PASSWORD, DELETE_ACCOUNT, GET_MY_REQUESTS, GET_ASSIGNEE_REQUESTS } from '../../api/queries'
import type {
    ProfileData,
    UpdateUsernameData,
    ChangePasswordData,
    DeleteAccountData,
    HelpRequestsPageData,
} from '../../api/types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { setAuth, clearAuth } from '../../store/authSlice'
import { PageSpinner } from '../../components/Spinner'
import Modal from '../../components/Modal'
import RequestCard from '../requests/RequestCard'

const PAGE_SIZE = 5

type ProfileTab = 'owner' | 'assignee'

export default function ProfilePage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const userId = useAppSelector(s => s.auth.userId)

    // Стан для username
    const [editingUsername, setEditingUsername] = useState(false)
    const [newUsername, setNewUsername] = useState('')

    // Стан для паролю
    const [editingPassword, setEditingPassword] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    })
    const [showPasswords, setShowPasswords] = useState(false)

    // Стан для видалення
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    // Вкладки заявок
    const [activeTab, setActiveTab] = useState<ProfileTab>('owner')
    const [ownerPage, setOwnerPage] = useState(1)
    const [assigneePage, setAssigneePage] = useState(1)

    // GET_PROFILE
    const { data: profileData, loading: profileLoading } = useQuery<ProfileData>(GET_PROFILE, {
        fetchPolicy: 'network-only',
    })

    // Заявки як власник
    const { data: ownerData, loading: ownerLoading } = useQuery<HelpRequestsPageData>(
        GET_MY_REQUESTS,
        {
            variables: { page: ownerPage, pageSize: PAGE_SIZE, creatorId: userId },
            skip: !userId || activeTab !== 'owner',
            fetchPolicy: 'no-cache',  // ← змінити
        }
    )


    // Заявки як помічник
    const { data: assigneeData, loading: assigneeLoading } = useQuery<HelpRequestsPageData>(
        GET_ASSIGNEE_REQUESTS,
        {
            variables: { page: assigneePage, pageSize: PAGE_SIZE, assignedUserId: userId },
            skip: !userId || activeTab !== 'assignee',
            fetchPolicy: 'no-cache',  // ← змінити
        }
    )

    // Mutations
    const [updateUsername, { loading: updatingUsername }] = useMutation<UpdateUsernameData>(
        UPDATE_USERNAME,
        {
            onCompleted: (data) => {
                const result = data.auth.updateUsername
                if (result.error) {
                    dispatch(addToast({ type: 'error', message: result.error.message }))
                } else {
                    dispatch(addToast({ type: 'success', message: 'Ім\'я змінено!' }))
                    dispatch(setAuth({
                        userId: userId ?? '',
                        username: newUsername,
                        email: profile?.email ?? '',
                    }))
                    setEditingUsername(false)
                }
            },
            onError: () => dispatch(addToast({ type: 'error', message: 'Помилка зміни імені' })),
        }
    )

    const [changePassword, { loading: changingPassword }] = useMutation<ChangePasswordData>(
        CHANGE_PASSWORD,
        {
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
            onError: () => dispatch(addToast({ type: 'error', message: 'Помилка зміни паролю' })),
        }
    )

    const [deleteAccount, { loading: deletingAccount }] = useMutation<DeleteAccountData>(
        DELETE_ACCOUNT,
        {
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
            onError: () => dispatch(addToast({ type: 'error', message: 'Помилка видалення акаунту' })),
        }
    )

    if (profileLoading) return <PageSpinner />

    const profile = profileData?.userQuery.profile.profile

    if (!profile) return (
        <div className="text-center py-16 text-ink-muted">
            Профіль не знайдено
        </div>
    )

    const ownerItems = ownerData?.helpRequestQuer.helpRequestQuery.items ?? []
    const assigneeItems = assigneeData?.helpRequestQuer.helpRequestQuery.items ?? []

    const currentItems = activeTab === 'owner' ? ownerItems : assigneeItems
    const currentLoading = activeTab === 'owner' ? ownerLoading : assigneeLoading
    const currentPage = activeTab === 'owner' ? ownerPage : assigneePage
    const setCurrentPage = activeTab === 'owner' ? setOwnerPage : setAssigneePage

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Заголовок */}
            <h1 className="text-2xl font-bold text-ink"
                style={{ fontFamily: 'Jua, sans-serif' }}>
                Профіль
            </h1>

            {/* Інформація профілю */}
            <div className="bg-surface rounded-xl border border-border p-6 space-y-5">

                {/* Username */}
                <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                        Ім'я користувача
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={editingUsername ? newUsername : profile.username}
                            onChange={e => setNewUsername(e.target.value)}
                            disabled={!editingUsername}
                            className="flex-1 px-4 py-2.5 bg-surface-muted border border-border rounded-lg text-ink text-sm disabled:opacity-70 focus:outline-none focus:border-primary transition-colors"
                        />
                        {editingUsername ? (
                            <div className="flex gap-1">
                                <button
                                    onClick={() => {
                                        if (!newUsername.trim()) return
                                        updateUsername({ variables: { newUsername: newUsername.trim() } })
                                    }}
                                    disabled={updatingUsername || !newUsername.trim()}
                                    className="p-2 bg-success text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingUsername(false)
                                        setNewUsername('')
                                    }}
                                    className="p-2 border border-border rounded-lg text-ink-muted hover:text-ink transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setEditingUsername(true)
                                    setNewUsername(profile.username)
                                }}
                                className="p-2 border border-border rounded-lg text-ink-muted hover:text-primary hover:border-primary transition-colors"
                            >
                                <Pencil size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-4 py-2.5 bg-surface-muted border border-border rounded-lg text-ink text-sm opacity-70"
                    />
                </div>

                {/* Пароль */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                            Пароль
                        </label>
                        {!editingPassword && (
                            <button
                                onClick={() => setEditingPassword(true)}
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                                <Pencil size={12} />
                                Змінити
                            </button>
                        )}
                    </div>

                    {editingPassword ? (
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type={showPasswords ? 'text' : 'password'}
                                    value={passwordForm.oldPassword}
                                    onChange={e => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
                                    placeholder="Поточний пароль"
                                    className="w-full px-4 py-2.5 bg-surface-muted border border-border rounded-lg text-ink text-sm focus:outline-none focus:border-primary transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
                                >
                                    {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                                placeholder="Новий пароль"
                                className="w-full px-4 py-2.5 bg-surface-muted border border-border rounded-lg text-ink text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                value={passwordForm.confirmNewPassword}
                                onChange={e => setPasswordForm(f => ({ ...f, confirmNewPassword: e.target.value }))}
                                placeholder="Підтвердіть новий пароль"
                                className="w-full px-4 py-2.5 bg-surface-muted border border-border rounded-lg text-ink text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => changePassword({ variables: passwordForm })}
                                    disabled={changingPassword || !passwordForm.oldPassword || !passwordForm.newPassword}
                                    className="flex-1 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light disabled:opacity-60 transition-colors"
                                >
                                    {changingPassword ? 'Збереження...' : 'Зберегти'}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingPassword(false)
                                        setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' })
                                    }}
                                    className="flex-1 py-2 border border-border text-ink text-sm font-medium rounded-lg hover:border-primary transition-colors"
                                >
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    ) : (
                        <input
                            type="password"
                            value="••••••••"
                            disabled
                            className="w-full px-4 py-2.5 bg-surface-muted border border-border rounded-lg text-ink text-sm opacity-70"
                        />
                    )}
                </div>

                {/* Дата реєстрації */}
                <div className="pt-2 border-t border-border">
                    <p className="text-xs text-ink-muted">
                        Зареєстрований:{' '}
                        <span className="font-medium text-ink">
                            {new Date(profile.registeredAtUtc).toLocaleDateString('uk-UA', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                    </p>
                </div>

                {/* Видалення акаунту */}
                <div className="pt-2 border-t border-border">
                    <button
                        onClick={() => setDeleteModalOpen(true)}
                        className="text-sm text-error hover:underline"
                    >
                        Видалити акаунт
                    </button>
                </div>
            </div>

            {/* Заявки */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="flex border-b border-border">
                    {([
                        { key: 'owner', label: 'Мої заявки' },
                        { key: 'assignee', label: 'Допомагаю' },
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.key
                                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                                    : 'text-ink-muted hover:text-ink'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-4">
                    {currentLoading && (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {!currentLoading && currentItems.length === 0 && (
                        <div className="text-center py-8 text-ink-muted text-sm">
                            {activeTab === 'owner'
                                ? 'Ви ще не створювали заявок'
                                : 'Ви ще не допомагали жодній людині'}
                        </div>
                    )}

                    {!currentLoading && currentItems.length > 0 && (
                        <div className="space-y-3">
                            {currentItems.map(item => (
                                <RequestCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}

                    {/* Пагінація */}
                    {!currentLoading && (currentPage > 1 || currentItems.length === PAGE_SIZE) && (
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:border-primary text-ink disabled:opacity-40 transition-colors"
                            >
                                ← Попередня
                            </button>
                            <span className="text-sm text-ink-muted">Сторінка {currentPage}</span>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentItems.length < PAGE_SIZE}
                                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:border-primary text-ink disabled:opacity-40 transition-colors"
                            >
                                Наступна →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Модал видалення */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Видалити акаунт"
            >
                <div className="space-y-4">
                    <p className="text-sm text-ink-muted leading-relaxed">
                        Ви впевнені що хочете видалити акаунт? Цю дію неможливо скасувати.
                        Переконайтесь що у вас немає активних заявок.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-ink hover:border-primary transition-colors"
                        >
                            Скасувати
                        </button>
                        <button
                            onClick={() => deleteAccount()}
                            disabled={deletingAccount}
                            className="flex-1 py-2.5 bg-error text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-colors"
                        >
                            {deletingAccount ? 'Видалення...' : 'Видалити'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}