import { Link, Outlet, useLocation } from 'react-router-dom'
import { Sun, Moon, LogOut, MessageCircle, ClipboardList, Shield, User, BarChart2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatPanel from '../features/chat/ChatPanel'
import { toggleChatPanel, toggleReportsPanel } from '../store/uiSlice'
import Logo from '../components/Logo'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleTheme } from '../store/themeSlice'
import { useLogout } from '../features/auth/useAuth'
import ReportsPanel from '../features/reports/ReportsPanel'
import Footer from '../components/Footer'
import NotificationBell from '../features/notifications/NotificationBell'

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
                        <Link to="/" className="hover:opacity-80 transition-opacity">
                            <Logo size={32} />
                        </Link>

                        <nav className="hidden lg:flex items-center gap-1">
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

                            <div className="h-6 w-px bg-border mx-1 hidden lg:block" />

                            <button
                                onClick={() => dispatch(toggleChatPanel())}
                                className="hidden lg:flex p-2 rounded-xl text-ink-muted hover:text-primary hover:bg-primary/5 transition-all relative"
                                title="Повідомлення"
                            >
                                <MessageCircle size={18} />
                            </button>

                            <NotificationBell />

                            <button
                                onClick={() => dispatch(toggleReportsPanel())}
                                className="hidden lg:flex p-2 rounded-xl text-ink-muted hover:text-primary hover:bg-primary/5 transition-all"
                                title="Звіти"
                            >
                                <ClipboardList size={18} />
                            </button>

                            {role === 'Admin' && (
                                <Link 
                                    to="/admin"
                                    className="hidden lg:flex p-2 rounded-xl text-ink-muted hover:text-primary hover:bg-primary/5 transition-all"
                                    title="Адмін-панель"
                                >
                                    <Shield size={18} />
                                </Link>
                            )}

                            <Link 
                                    to="/profile"
                                    className={`hidden lg:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border transition-all ${
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
                                className="hidden lg:flex p-2 rounded-xl text-ink-muted hover:text-error hover:bg-error/5 transition-all disabled:opacity-50"
                                title="Вийти"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6 pb-28 lg:pb-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            <ChatPanel />
            <ReportsPanel />

            <Footer />

            {/* Мобільна нижня панель навігації */}
            <div className="lg:hidden fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[480px] z-40 bg-surface/85 backdrop-blur-xl border border-border/40 shadow-xl px-6 py-3 flex items-center justify-around rounded-2xl">
                {/* Заявки */}
                <Link 
                    to="/requests" 
                    className={`flex flex-col items-center justify-center py-1 transition-all ${
                        location.pathname.startsWith('/requests') ? 'text-primary animate-pulse' : 'text-ink-muted'
                    }`}
                >
                    <ClipboardList size={20} className={location.pathname.startsWith('/requests') ? 'scale-110' : ''} />
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1">Заявки</span>
                </Link>

                {/* Статистика */}
                <Link 
                    to="/stats" 
                    className={`flex flex-col items-center justify-center py-1 transition-all ${
                        location.pathname === '/stats' ? 'text-primary' : 'text-ink-muted'
                    }`}
                >
                    <BarChart2 size={20} className={location.pathname === '/stats' ? 'scale-110' : ''} />
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1">Статистика</span>
                </Link>

                {/* Повідомлення */}
                <button
                    onClick={() => dispatch(toggleChatPanel())}
                    className="flex flex-col items-center justify-center py-1 text-ink-muted hover:text-ink relative transition-all"
                >
                    <MessageCircle size={20} />
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1">Чати</span>
                </button>

                {/* Адмін-панель */}
                {role === 'Admin' && (
                    <Link 
                        to="/admin" 
                        className={`flex flex-col items-center justify-center py-1 transition-all ${
                            location.pathname.startsWith('/admin') ? 'text-primary' : 'text-ink-muted'
                        }`}
                    >
                        <Shield size={20} className={location.pathname.startsWith('/admin') ? 'scale-110' : ''} />
                        <span className="text-[9px] font-black uppercase tracking-widest mt-1">Адмін</span>
                    </Link>
                )}

                {/* Профіль */}
                <Link 
                    to="/profile" 
                    className={`flex flex-col items-center justify-center py-1 transition-all ${
                        location.pathname === '/profile' ? 'text-primary' : 'text-ink-muted'
                    }`}
                >
                    <User size={20} className={location.pathname === '/profile' ? 'scale-110' : ''} />
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1">Профіль</span>
                </Link>
            </div>
        </div>
    )
}