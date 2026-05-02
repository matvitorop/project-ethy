import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'

export default function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="px-8 py-5 border-b border-border bg-surface">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/">
                        <Logo size={36} />
                    </Link>
                    <nav className="flex items-center gap-3">
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