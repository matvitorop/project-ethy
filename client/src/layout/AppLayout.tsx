import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'

export default function AppLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="px-8 py-4 border-b border-border bg-surface sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/requests">
                        <Logo size={36} />
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link to="/requests" className="text-sm font-medium text-ink hover:text-primary">
                            Заявки
                        </Link>
                        <Link to="/profile" className="text-sm font-medium text-ink hover:text-primary">
                            Профіль
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}