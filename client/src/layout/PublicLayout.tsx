import { Link, Outlet, useLocation } from 'react-router-dom'
import { Sun, Moon, ClipboardList, BarChart2, MessageCircle, User, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '../components/Logo'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleTheme } from '../store/themeSlice'
import { toggleChatPanel } from '../store/uiSlice'
import Button from '../components/ui/Button'
import Footer from '../components/Footer'

export default function PublicLayout() {
    const dispatch = useAppDispatch()
    const location = useLocation()
    const theme = useAppSelector(s => s.theme.current)
    const userId = useAppSelector(s => s.auth.userId)
    const username = useAppSelector(s => s.auth.username)
    const role = useAppSelector(s => s.auth.role)

    return (
        <div className="min-h-screen flex flex-col bg-surface-muted transition-colors duration-300">
            <header className="sticky top-0 z-50 w-full px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between bg-surface/80 backdrop-blur-md border border-white/20 shadow-sm rounded-2xl px-6 py-2">
                    <Link to="/" className="hover:opacity-80 transition-opacity">
                        <Logo size={32} />
                    </Link>
                    <nav className="flex items-center gap-2">
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 rounded-xl text-ink-muted hover:text-primary hover:bg-primary/5 transition-all mr-1"
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        
                        <Link to="/stats"
                            className="hidden sm:inline-block px-4 py-2 text-sm font-semibold text-ink-muted hover:text-primary transition-all">
                            Статистика
                        </Link>

                        {role === 'Admin' && (
                            <Link to="/admin"
                                className="hidden sm:inline-block px-4 py-2 text-sm font-semibold text-ink-muted hover:text-primary transition-all">
                                Адмін-панель
                            </Link>
                        )}

                        <div className="hidden sm:block h-6 w-px bg-border mx-2" />

                        {userId ? (
                            <Link to="/profile">
                                <Button variant="outline" size="sm" className="max-w-[100px] md:max-w-[150px] truncate">
                                    {username}
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                                        Увійти
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="px-3 sm:px-4">
                                        Почати
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>
            <main className={`flex-1 ${userId ? 'pb-28 lg:pb-0' : ''}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />

            {/* Мобільна нижня панель навігації для авторизованих користувачів */}
            {userId && (
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
            )}
        </div>
    )
}