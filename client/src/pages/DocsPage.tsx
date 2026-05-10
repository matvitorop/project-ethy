import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, UserCheck, Map, MessageSquare, BarChart3, Globe, Mail, Clock, Trash2 } from 'lucide-react'

type Language = 'ua' | 'en'

export default function DocsPage() {
    const [lang, setLang] = useState<Language>('ua')

    const content = {
        ua: {
            title: 'Документація проєкту Ethy',
            subtitle: 'Дізнайтеся більше про те, як працює платформа та як ми захищаємо ваші дані.',
            sections: [
                {
                    id: 'workflow-user',
                    title: 'Для тих, хто потребує допомоги',
                    icon: <UserCheck className="text-primary" />,
                    text: 'Ethy допомагає вам швидко отримати підтримку від небайдужих людей.',
                    items: [
                        { icon: <Map size={18} />, title: 'Створення заявки', text: 'Опишіть свою потребу та вкажіть місце на карті. Ви можете вибрати точні координати або загальний район.' },
                        { icon: <MessageSquare size={18} />, title: 'Прямий зв\'язок', text: 'Після того, як волонтер відгукнеться, у вас відкриється чат для уточнення деталей.' },
                        { icon: <Clock size={18} />, title: 'Статуси', text: 'Відстежуйте стан вашої заявки: від "Відкрито" до "Виконано".' }
                    ]
                },
                {
                    id: 'workflow-volunteer',
                    title: 'Для волонтерів',
                    icon: <Globe className="text-primary" />,
                    text: 'Станьте частиною спільноти та допомагайте іншим ефективно.',
                    items: [
                        { icon: <UserCheck size={18} />, title: 'Верифікація', text: 'Подайте заявку на статус волонтера, надавши документ. Це підвищує довіру до вас.' },
                        { icon: <BarChart3 size={18} />, title: 'Звітність', text: 'Після надання допомоги завантажте короткий звіт із фото для підтвердження виконання.' },
                        { icon: <Shield size={18} />, title: 'Рейтинг', text: 'Отримуйте позитивні відгуки та підвищуйте свій статус у системі.' }
                    ]
                },
                {
                    id: 'trust',
                    title: 'Система довіри',
                    icon: <Shield className="text-primary" />,
                    items: [
                        { icon: <Shield size={18} />, title: 'Відгуки', text: 'Після завершення допомоги обидві сторони можуть залишити відгук.' },
                        { icon: <Trash2 size={18} />, title: 'Скарги', text: 'Якщо ви зіткнулися з порушенням правил, повідомте про це через систему скарг.' }
                    ]
                },
                {
                    id: 'privacy',
                    title: 'Політика конфіденційності',
                    icon: <Shield className="text-primary" />,
                    text: 'Ваша конфіденційність — наш пріоритет. Ось ключові моменти нашої політики:',
                    items: [
                        { icon: <Mail size={18} />, title: 'Дані при реєстрації', text: 'Ми збираємо лише необхідне: email, ім\'я та номер телефону для зв\'язку.' },
                        { icon: <Shield size={18} />, title: 'Безпека паролів', text: 'Паролі шифруються з використанням солі та сучасних алгоритмів хешування.' },
                        { icon: <Trash2 size={18} />, title: 'Право на забуття', text: 'Ви можете видалити свій профіль. Дані будуть анонімізовані для збереження історії.' },
                        { icon: <Clock size={18} />, title: 'Зберігання', text: 'Всі дані надійно зберігаються у хмарі Microsoft Azure.' }
                    ]
                }
            ],
            footer: 'Маєте запитання? Зверніться до нашої служби підтримки.'
        },
        en: {
            title: 'Ethy Project Documentation',
            subtitle: 'Learn more about how the platform works and how we protect your data.',
            sections: [
                {
                    id: 'workflow-user',
                    title: 'For Those in Need',
                    icon: <UserCheck className="text-primary" />,
                    text: 'Ethy helps you quickly get support from caring people.',
                    items: [
                        { icon: <Map size={18} />, title: 'Creating a Request', text: 'Describe your need and mark it on the map. You can choose exact coordinates or a general area.' },
                        { icon: <MessageSquare size={18} />, title: 'Direct Contact', text: 'Once a volunteer responds, a chat will open to discuss the details.' },
                        { icon: <Clock size={18} />, title: 'Statuses', text: 'Track your request state: from "Open" to "Completed".' }
                    ]
                },
                {
                    id: 'workflow-volunteer',
                    title: 'For Volunteers',
                    icon: <Globe className="text-primary" />,
                    text: 'Become part of the community and help others effectively.',
                    items: [
                        { icon: <UserCheck size={18} />, title: 'Verification', text: 'Apply for volunteer status by providing an ID. This increases trust in your profile.' },
                        { icon: <BarChart3 size={18} />, title: 'Reporting', text: 'After providing help, upload a short report with a photo to confirm completion.' },
                        { icon: <Shield size={18} />, title: 'Rating', text: 'Earn positive feedback and boost your status within the system.' }
                    ]
                },
                {
                    id: 'trust',
                    title: 'Trust System',
                    icon: <Shield className="text-primary" />,
                    items: [
                        { icon: <Shield size={18} />, title: 'Feedback', text: 'After the help is completed, both parties can leave a review.' },
                        { icon: <Trash2 size={18} />, title: 'Complaints', text: 'If you encounter a violation of rules, report it through the complaint system.' }
                    ]
                },
                {
                    id: 'privacy',
                    title: 'Privacy Policy',
                    icon: <Shield className="text-primary" />,
                    text: 'Your privacy is our priority. Here are the key points of our policy:',
                    items: [
                        { icon: <Mail size={18} />, title: 'Registration Data', text: 'We collect only the essentials: email, name, and phone number for contact.' },
                        { icon: <Shield size={18} />, title: 'Password Security', text: 'Passwords are encrypted using salt and modern hashing algorithms.' },
                        { icon: <Trash2 size={18} />, title: 'Right to Erasure', text: 'You can delete your profile. Data will be anonymized to preserve history.' },
                        { icon: <Clock size={18} />, title: 'Storage', text: 'All data is securely stored in the Microsoft Azure cloud.' }
                    ]
                }
            ],
            footer: 'Have questions? Contact our support team.'
        }
    }

    const t = content[lang]

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-ink tracking-tight mb-2">{t.title}</h1>
                    <p className="text-ink-soft text-lg font-medium">{t.subtitle}</p>
                </div>

                <button
                    onClick={() => setLang(l => l === 'ua' ? 'en' : 'ua')}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl hover:border-primary/50 transition-all shadow-sm group"
                >
                    <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-bold text-sm uppercase">{lang === 'ua' ? 'English' : 'Українська'}</span>
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={lang}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid gap-8"
                >
                    {t.sections.map((section) => (
                        <section key={section.id} className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-ink">{section.title}</h2>
                            </div>

                            {section.text && <p className="mb-8 text-ink-muted leading-relaxed">{section.text}</p>}

                            <div className="grid md:grid-cols-2 gap-6">
                                {section.items.map((item, idx) => (
                                    <div key={idx} className="p-6 border border-border/50 rounded-2xl hover:bg-primary/5 transition-colors group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="text-primary group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </div>
                                            <h3 className="font-bold text-ink">{item.title}</h3>
                                        </div>
                                        <p className="text-sm text-ink-soft leading-relaxed">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </motion.div>
            </AnimatePresence>

            <div className="text-center pt-8 border-t border-border">
                <p className="text-ink-soft font-medium">{t.footer}</p>
                <div className="mt-4 flex justify-center gap-4">
                    <a href="mailto:support@ethy.org" className="text-primary font-bold hover:underline">support@ethy.org</a>
                </div>
            </div>
        </div>
    )
}
