import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Search, X, Users } from 'lucide-react'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { UNBLOCK_USER, BLOCK_USER } from '../../api/queries'
import type { AdminUserDto, ApiError } from '../../api/types'

interface UnblockUserData {
    admin: { unblockUser: { success: boolean; error: ApiError | null } }
}
interface BlockUserData {
    admin: { blockUser: { success: boolean; error: ApiError | null } }
}
import { PageSpinner } from '../../components/Spinner'
import Card from '../../components/ui/Card'
import UserLink from '../../components/ui/UserLink'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/Modal'
import { formatDateTime } from '../../hooks/useDateTime'

function formatLastActivity(dateStr: string | null | undefined) {
    if (!dateStr) return 'немає'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'сьогодні'
    if (diffDays === 1) return 'вчора'
    if (diffDays < 7) return `${diffDays} дн. тому`
    
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}

export interface UsersTabProps {
    items: AdminUserDto[]
    loading: boolean
    onRefresh: () => void
    search: string
    onSearchChange: (s: string) => void
    shortId: string
    onShortIdChange: (id: string) => void
}

export default function UsersTab({ items, loading, onRefresh, search, onSearchChange, shortId, onShortIdChange }: UsersTabProps) {
    const dispatch = useAppDispatch()
    const [blockModal, setBlockModal] = useState<{ userId: string; username: string } | null>(null)
    const [blockForm, setBlockForm] = useState({ reason: '', hours: '24' })

    const [unblock] = useMutation<UnblockUserData>(UNBLOCK_USER, {
        onCompleted: (data) => {
            const r = data.admin.unblockUser
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else { dispatch(addToast({ type: 'success', message: 'Користувача розблоковано' })); onRefresh() }
        },
    })

    const [block, { loading: blocking }] = useMutation<BlockUserData>(BLOCK_USER, {
        onCompleted: (data) => {
            const r = data.admin.blockUser
            if (r.error) dispatch(addToast({ type: 'error', message: r.error.message }))
            else {
                dispatch(addToast({ type: 'success', message: 'Користувача заблоковано' }))
                setBlockModal(null)
                setBlockForm({ reason: '', hours: '24' })
                onRefresh()
            }
        },
    })

    const BLOCK_PRESETS = [
        { label: '1 д', hours: 24 }, { label: '3 д', hours: 72 },
        { label: '7 д', hours: 168 }, { label: '30 д', hours: 720 },
        { label: '∞', hours: 0 },
    ]

    const ROLE_LABELS: Record<number, string> = { 0: 'Адмін', 1: 'Користувач', 2: 'Волонтер' }

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id.slice(-6))
        dispatch(addToast({ type: 'success', message: 'ID скопійовано' }))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-muted/30 p-4 rounded-3xl border border-border/50">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => onSearchChange(e.target.value)}
                            placeholder="Пошук за ім'ям або email..."
                            className="w-full pl-11 pr-10 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        />
                        {search && (
                            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-error transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="relative w-full sm:w-48 group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-bold text-xs">#</span>
                        <input
                            type="text"
                            value={shortId}
                            onChange={e => onShortIdChange(e.target.value)}
                            placeholder="ID (6 знаків)"
                            maxLength={6}
                            className="w-full pl-11 pr-10 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        />
                        {shortId && (
                            <button onClick={() => onShortIdChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-error transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <PageSpinner />
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
                        <Users size={32} className="text-ink-soft mx-auto mb-4 opacity-50" />
                        <p className="text-ink-soft font-bold uppercase text-xs tracking-widest">Користувачів не знайдено</p>
                    </div>
                ) : (
                    items.map((u: AdminUserDto) => (
                        <Card key={u.id} padding="sm" className={u.isDeleted ? 'opacity-50 grayscale' : ''}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <UserLink userId={u.id} username={u.username} className="font-bold text-ink text-base hover:text-primary transition-colors" />
                                        <Badge variant={u.role === 0 ? 'error' : u.role === 2 ? 'success' : 'default'}>
                                            {ROLE_LABELS[u.role]}
                                        </Badge>
                                        {u.isBlocked && <Badge variant="error">Заблокований</Badge>}
                                        {u.isDeleted && <Badge variant="outline">Видалений</Badge>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-ink-soft uppercase tracking-widest">
                                        <span>{u.email}</span>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <button
                                            onClick={() => handleCopyId(u.id)}
                                            className="hover:text-primary transition-colors"
                                            title="Копіювати повний ID"
                                        >
                                            ID: ...{u.id.slice(-6)}
                                        </button>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <span>Реєстрація: {formatDateTime(u.registeredAtUtc)}</span>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <span className={u.lastActivityAtUtc && (new Date().getTime() - new Date(u.lastActivityAtUtc).getTime()) < 10 * 60 * 1000 ? 'text-success' : ''}>
                                            Активність: {formatLastActivity(u.lastActivityAtUtc)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!u.isDeleted && (
                                        u.isBlocked ? (
                                            <Button variant="success" size="sm" onClick={() => unblock({ variables: { targetUserId: u.id } })}>
                                                Розблокувати
                                            </Button>
                                        ) : (
                                            <Button variant="error" size="sm" onClick={() => setBlockModal({ userId: u.id, username: u.username })}>
                                                Заблокувати
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

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
                        <label className="block text-[10px] font-black text-ink-soft uppercase tracking-widest mb-3">Причина</label>
                        <input
                            type="text"
                            value={blockForm.reason}
                            onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}
                            placeholder="Вкажіть причину..."
                            className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setBlockModal(null)}>Скасувати</Button>
                        <Button
                            variant="error"
                            className="flex-1"
                            disabled={blocking || !blockForm.reason}
                            onClick={() => {
                                const until = blockForm.hours === '0' ? null : new Date(Date.now() + parseInt(blockForm.hours) * 60 * 60 * 1000).toISOString()
                                block({ variables: { targetUserId: blockModal!.userId, reason: blockForm.reason, blockedUntilUtc: until } })
                            }}
                        >
                            {blocking ? 'Блокування...' : 'Підтвердити'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
