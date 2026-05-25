import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useAppSelector } from '../store/hooks'

export default function Footer() {
    const userId = useAppSelector(s => s.auth.userId)

    return (
        <footer className={`pt-8 ${userId ? 'pb-32 lg:pb-8' : 'pb-8'} px-6 border-t border-border bg-surface mt-auto`}>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <Logo size={24} showText={false} />
                    <span className="text-sm font-bold text-ink-muted tracking-tight">Project Ethy</span>
                </div>
                <p className="text-xs text-ink-soft font-medium">
                    © {new Date().getFullYear()} Ethy. Платформа для взаємодопомоги.
                </p>
                <div className="flex gap-6">
                    <Link to="/privacy" className="text-xs text-ink-soft hover:text-primary transition-colors font-medium">
                        Політика конфіденційності
                    </Link>
                    <a href="#" className="text-xs text-ink-soft hover:text-primary transition-colors font-medium">
                        Підтримка
                    </a>
                </div>
            </div>
        </footer>
    )
}
