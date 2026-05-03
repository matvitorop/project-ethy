import { Link } from 'react-router-dom'

export default function HomePage() {
    return (
        <div className="flex items-center">
            <div className="max-w-6xl mx-auto px-8 py-20 grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="inline-block px-3 py-1 bg-accent/20 text-ink text-xs font-semibold rounded-full mb-6 tracking-wide">
                        ПЛАТФОРМА АДРЕСНОЇ ДОПОМОГИ
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-primary leading-[1.05] tracking-tight mb-6"
                        style={{ fontFamily: 'Jua, sans-serif' }}>
                        Допомога,<br />
                        якій можна<br />
                        <span className="text-accent-dark">довіряти</span>
                    </h1>
                    <p className="text-lg text-ink-muted leading-relaxed mb-8 max-w-md">
                        Ethy поєднує тих, хто потребує допомоги, з тими, хто готовий її надати.
                        Прозоро, структуровано і з підтвердженням кожного етапу.
                    </p>
                    <div className="flex gap-3">
                        <Link
                            to="/register"
                            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors"
                        >
                            Почати
                        </Link>
                        <Link
                            to="/login"
                            className="px-6 py-3 border border-border text-ink rounded-lg font-semibold hover:border-primary transition-colors"
                        >
                            Я вже маю акаунт
                        </Link>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-accent/30 rounded-3xl rotate-3"></div>
                    <div className="relative bg-surface rounded-3xl border border-border p-8 shadow-sm">
                        <div className="space-y-4">
                            {[
                                { num: '01', title: 'Створіть запит', text: 'Опишіть що саме потрібно' },
                                { num: '02', title: 'Отримайте відгуки', text: 'Оберіть кращого виконавця' },
                                { num: '03', title: 'Узгодьте етапи', text: 'Підтверджуйте кожен крок' },
                                { num: '04', title: 'Завершіть з довірою', text: 'Звіт про отримання' },
                            ].map(step => (
                                <div key={step.num} className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-accent rounded-lg flex items-center justify-center font-bold text-sm">
                                        {step.num}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-ink">{step.title}</div>
                                        <div className="text-sm text-ink-muted">{step.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}