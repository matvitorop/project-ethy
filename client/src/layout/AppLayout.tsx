import { Link, Outlet } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import Logo from '../components/Logo'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleTheme } from '../store/themeSlice'

export default function AppLayout() {
    const dispatch = useAppDispatch()
    const theme = useAppSelector(s => s.theme.current)

    return (
        <div className="min-h-screen flex flex-col">
            <header className="px-8 py-4 border-b border-border bg-surface sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/requests">
                        <Logo size={36} />
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link to="/requests" className="text-sm font-medium text-ink hover:text-primary transition-colors">
                            Заявки
                        </Link>
                        <Link to="/profile" className="text-sm font-medium text-ink hover:text-primary transition-colors">
                            Профіль
                        </Link>
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 rounded-lg border border-border hover:border-primary text-ink-muted hover:text-primary transition-colors"
                        >
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                    </nav>
                </div>
            </header>
            <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}