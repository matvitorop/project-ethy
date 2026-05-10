import { Link, Outlet, useLocation } from 'react-router-dom'
import { Sun, Moon, LogOut, MessageCircle, ClipboardList, Shield, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatPanel from '../features/chat/ChatPanel'
import { toggleChatPanel, toggleReportsPanel } from '../store/uiSlice'
import Logo from '../components/Logo'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleTheme } from '../store/themeSlice'
import { useLogout } from '../features/auth/useAuth'
import ReportsPanel from '../features/reports/ReportsPanel'
import Button from '../components/ui/Button'

export default function AppLayout() {
    const dispatch = useAppDispatch()
    const location = useLocation()
    const theme = useAppSelector(s => s.theme.current)
    const username = useAppSelector(s => s.auth.username)
    const role = useAppSelector(s => s.auth.role)
    const { logout, loading: logoutLoading } = useLogout()

    const navItems = [
        { path: '/requests', label: 'Заявки' },
        { path: '/stats', label: 'Статистика' },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-surface-muted transition-colors duration-300">
            <header className="sticky top-0 z-50 w-full px-6 py-3">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-surface/80 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-2xl px-6 py-2 flex items-center justify-between">
                        <Link to="/requests" className="hover:opacity-80 transition-opacity">
                            <Logo size={32} />
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map(item => (
                                <Link 
                                    key={item.path}
                                    to={item.path}
                                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                                        location.pathname === item.path 
                                        ? 'bg-primary/10 text-primary' 
                                        : 'text-ink-muted hover:text-ink hover:bg-surface-muted'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => dispatch(toggleTheme())}
                                className="p-2 rounded-xl text-ink-muted hover:text-primary hover:bg-primary/5 transition-all"
                                title="Змінити тему"
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            </button>

                            <div className="h-6 w-px bg-border mx-1" />

                            <button
                                onClick={() => dispatch(toggleChatPanel())}
                                className="p-2 rounded-xl text-ink-muted hover:text-primary hover:bg-primary/5 transition-all relative"
                                title="Повідомлення"
                            >
                                <MessageCircle size={18} />
                            </button>

                            <button
                                onClick={() => dispatch(toggleReportsPanel())}
                                className="p-2 rounded-xl text-ink-muted hover:text-primary hover:bg-primary/5 transition-all"
                                title="Звіти"
                            >
                                <ClipboardList size={18} />
                            </button>

                            {role === 'Admin' && (
                                <Link 
                                    to="/admin"
                                    className="p-2 rounded-xl text-ink-muted hover:text-primary hover:bg-primary/5 transition-all"
                                    title="Адмін-панель"
                                >
                                    <Shield size={18} />
                                </Link>
                            )}

                            <Link 
                                to="/profile"
                                className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border transition-all ${
                                    location.pathname === '/profile'
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-border bg-surface hover:border-primary/50'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                    location.pathname === '/profile' ? 'bg-white/20' : 'bg-primary/10 text-primary'
                                }`}>
                                    <User size={14} />
                                </div>
                                <span className="text-xs font-bold hidden sm:inline">{username || 'Профіль'}</span>
                            </Link>

                            <button
                                onClick={() => logout()}
                                disabled={logoutLoading}
                                className="p-2 rounded-xl text-ink-muted hover:text-error hover:bg-error/5 transition-all disabled:opacity-50"
                                title="Вийти"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            <ChatPanel />
            <ReportsPanel />

            <footer className="py-8 px-6 border-t border-border bg-surface mt-auto">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Logo size={24} showText={false} />
                        <span className="text-sm font-bold text-ink-muted tracking-tight">Project Ethy</span>
                    </div>
                    <p className="text-xs text-ink-soft font-medium">
                        © {new Date().getFullYear()} Ethy. Платформа для взаємодопомоги.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-xs text-ink-soft hover:text-primary transition-colors font-medium">Документація</a>
                        <a href="#" className="text-xs text-ink-soft hover:text-primary transition-colors font-medium">Підтримка</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}