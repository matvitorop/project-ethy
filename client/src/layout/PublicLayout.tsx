import { Link, Outlet, useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '../components/Logo'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleTheme } from '../store/themeSlice'
import Button from '../components/ui/Button'

export default function PublicLayout() {
    const dispatch = useAppDispatch()
    const location = useLocation()
    const theme = useAppSelector(s => s.theme.current)
    const userId = useAppSelector(s => s.auth.userId)
    const username = useAppSelector(s => s.auth.username)

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
                            className="px-4 py-2 text-sm font-semibold text-ink-muted hover:text-primary transition-all">
                            Статистика
                        </Link>

                        <div className="h-6 w-px bg-border mx-2" />

                        {userId ? (
                            <Link to="/profile">
                                <Button variant="outline" size="sm">
                                    {username}
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">
                                        Увійти
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">
                                        Почати
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>
            <main className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}