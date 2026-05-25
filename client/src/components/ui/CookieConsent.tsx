import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

export default function CookieConsent() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('ethy_cookie_consent')
        if (!consent) {
            // Показуємо банер з невеликою затримкою для кращого сприйняття
            const timer = setTimeout(() => {
                setVisible(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('ethy_cookie_consent', 'true')
        setVisible(false)
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="fixed bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:max-w-md z-50"
                >
                    <div className="bg-surface/85 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-3xl p-5 md:p-6 flex flex-col gap-4 relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute -right-10 -top-10 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                                <Cookie className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-ink uppercase tracking-tight flex items-center gap-2">
                                    Цей сайт використовує Cookies
                                </h4>
                                <p className="text-xs text-ink-soft leading-relaxed">
                                    Ми використовуємо файли cookies для безпеки авторизації та покращення вашого досвіду користування платформою Ethy. Детальніше у нашому{' '}
                                    <Link to="/privacy" className="text-primary hover:underline font-bold">
                                        документі
                                    </Link>.
                                </p>
                            </div>
                            <button 
                                onClick={() => setVisible(false)}
                                className="text-ink-muted hover:text-ink transition-colors p-1 hover:bg-surface-muted rounded-lg"
                                title="Закрити"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="flex gap-3 justify-end items-center mt-2">
                            <Link to="/privacy" className="text-[10px] font-black text-ink-muted uppercase tracking-widest hover:text-ink transition-colors">
                                Докладніше
                            </Link>
                            <Button 
                                onClick={handleAccept}
                                size="sm"
                                className="px-5 py-2 text-xs font-black uppercase tracking-wider shadow-md shadow-primary/10"
                            >
                                Зрозуміло
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
