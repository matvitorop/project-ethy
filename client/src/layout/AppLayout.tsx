import { Link, Outlet } from 'react-router-dom'
import { Sun, Moon, LogOut, MessageCircle, ClipboardList, Shield } from 'lucide-react'
import ChatPanel from '../features/chat/ChatPanel'
import { toggleChatPanel, toggleReportsPanel } from '../store/uiSlice'
import Logo from '../components/Logo'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleTheme } from '../store/themeSlice'
import { useLogout } from '../features/auth/useAuth'
import ReportsPanel from '../features/reports/ReportsPanel'


export default function AppLayout() {
    const dispatch = useAppDispatch()
    const theme = useAppSelector(s => s.theme.current)
    const username = useAppSelector(s => s.auth.username)
    const role = useAppSelector(s => s.auth.role)
    const { logout, loading: logoutLoading } = useLogout()

    return (
        <div className="min-h-screen flex flex-col">
            <header className="px-8 py-4 border-b border-border bg-surface sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/requests">
                        <Logo size={36} />
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link to="/requests"
                            className="text-sm font-medium text-ink hover:text-primary transition-colors">
                            Заявки
                        </Link>
                        <Link to="/profile"
                            className="text-sm font-medium text-ink hover:text-primary transition-colors">
                            {username || 'Профіль'}
                        </Link>
                        {role === 'Admin' && (
                            <Link to="/admin"
                                className="p-2 rounded-lg border border-border hover:border-primary text-ink-muted hover:text-primary transition-colors"
                                title="Адмін-панель"
                            >
                                <Shield size={16} />
                            </Link>
                        )}
                        <button
                            onClick={() => dispatch(toggleChatPanel())}
                            className="p-2 rounded-lg border border-border hover:border-primary text-ink-muted hover:text-primary transition-colors"
                        >
                            <MessageCircle size={16} />
                        </button>
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 rounded-lg border border-border hover:border-primary text-ink-muted hover:text-primary transition-colors"
                        >
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                        <button
                            onClick={() => dispatch(toggleReportsPanel())}
                            className="p-2 rounded-lg border border-border hover:border-primary text-ink-muted hover:text-primary transition-colors"
                            title="Звіти"
                        >
                            <ClipboardList size={16} />
                        </button>
                        <button
                            onClick={() => logout()}
                            disabled={logoutLoading}
                            className="p-2 rounded-lg border border-border hover:border-error text-ink-muted hover:text-error transition-colors disabled:opacity-50"
                            title="Вийти"
                        >
                            <LogOut size={16} />
                        </button>
                    </nav>
                </div>
            </header>
            <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-8">
                <Outlet />
            </main>
            <ChatPanel />
            <ReportsPanel />
        </div>
    )
}