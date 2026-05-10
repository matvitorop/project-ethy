import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { motion } from 'framer-motion'
import { GET_PLATFORM_STATS } from '../api/queries'
import type { PlatformStatsData } from '../api/types'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function HomePage() {
    const { data } = useQuery<PlatformStatsData>(GET_PLATFORM_STATS, {
        fetchPolicy: 'cache-first',
    })
    const stats = data?.statsQuery.platformStats.stats

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="overflow-hidden">
            {/* Hero */}
            <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 bg-accent/15 text-accent-dark text-[10px] font-black rounded-full mb-8 tracking-[0.2em] border border-accent/20 uppercase">
                        Платформа адресної допомоги
                    </motion.div>
                    <motion.h1 
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-bold text-primary leading-[1.05] tracking-tight mb-8"
                        style={{ fontFamily: 'Jua, sans-serif' }}
                    >
                        Допомога,<br />
                        якій можна<br />
                        <span className="text-accent-dark relative">
                            довіряти
                            <svg className="absolute -bottom-2 left-0 w-full h-2 text-accent/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                            </svg>
                        </span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-lg text-ink-muted leading-relaxed mb-10 max-w-lg">
                        Ethy поєднує тих, хто потребує допомоги, з тими, хто готовий її надати.
                        Прозоро, структуровано і з підтвердженням кожного етапу.
                    </motion.p>
                    <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                        <Link to="/register">
                            <Button size="lg" className="min-w-[160px] shadow-lg shadow-primary/20">
                                Почати зараз
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg" className="min-w-[160px]">
                                Я вже з вами
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-accent/20 rounded-[2.5rem] rotate-3 blur-sm"></div>
                    <Card padding="lg" className="relative !rounded-[2.5rem] border-2 border-white/50 dark:border-white/5 shadow-2xl">
                        <div className="space-y-6">
                            {[
                                { num: '01', title: 'Створіть запит', text: 'Детально опишіть вашу потребу', color: 'bg-primary text-accent' },
                                { num: '02', title: 'Отримайте відгуки', text: 'Оберіть помічника за рейтингом', color: 'bg-accent text-primary' },
                                { num: '03', title: 'Узгодьте етапи', text: 'Контролюйте прогрес виконання', color: 'bg-primary text-accent' },
                                { num: '04', title: 'Завершіть успішно', text: 'Підтвердіть отримання результату', color: 'bg-accent text-primary' },
                            ].map((step, idx) => (
                                <motion.div 
                                    key={step.num} 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (idx * 0.1) }}
                                    className="flex gap-5 items-start p-2 rounded-2xl hover:bg-surface-muted transition-colors"
                                >
                                    <div className={`flex-shrink-0 w-12 h-12 ${step.color} rounded-xl flex items-center justify-center font-black text-lg shadow-sm`}>
                                        {step.num}
                                    </div>
                                    <div>
                                        <div className="font-bold text-ink text-lg leading-tight mb-1">{step.title}</div>
                                        <div className="text-sm text-ink-soft font-medium">{step.text}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Лічильники */}
            {stats && (
                <div className="bg-primary relative overflow-hidden">
                    {/* Декор */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-10 left-10 w-64 h-64 border border-white rounded-full"></div>
                        <div className="absolute bottom-10 right-10 w-96 h-96 border border-white rounded-full"></div>
                    </div>
                    
                    <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
                        <p className="text-center text-accent/60 text-xs font-black uppercase tracking-[0.3em] mb-12">
                            Ethy в цифрах
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                            <Counter value={stats.totalRequests} label="Заявок створено" />
                            <Counter value={stats.resolvedRequests} label="Виконано успішно" />
                            <Counter value={stats.totalUsers} label="Учасників платформи" />
                            <Counter value={stats.totalVolunteers} label="Активних волонтерів" />
                        </div>
                        <div className="text-center mt-16">
                            <Link to="/stats">
                                <button className="text-accent hover:text-white transition-colors font-bold text-sm flex items-center gap-2 mx-auto border-b border-accent/30 pb-1 hover:border-white">
                                    Переглянути детальну статистику
                                    <span>→</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function Counter({ value, label }: { value: number; label: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <p className="text-5xl font-black text-accent mb-2 tracking-tighter" style={{ fontFamily: 'Jua, sans-serif' }}>
                {value.toLocaleString('uk-UA')}
            </p>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{label}</p>
        </motion.div>
    )
}
