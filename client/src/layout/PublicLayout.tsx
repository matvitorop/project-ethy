import { Link, Outlet } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import Logo from '../components/Logo'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleTheme } from '../store/themeSlice'

export default function PublicLayout() {
    const dispatch = useAppDispatch()
    const theme = useAppSelector(s => s.theme.current)

    return (
        <div className="min-h-screen flex flex-col">
            <header className="px-8 py-5 border-b border-border bg-surface">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/">
                        <Logo size={36} />
                    </Link>
                    <nav className="flex items-center gap-3">
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 rounded-lg border border-border hover:border-primary text-ink-muted hover:text-primary transition-colors mr-2"
                        >
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                        <Link
                            to="/login"
                            className="px-4 py-2 text-sm font-medium text-ink hover:text-primary transition-colors"
                        >
                            Увійти
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                        >
                            Зареєструватись
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    )
}