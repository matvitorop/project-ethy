import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Globe, Mail, Lock, Eye, Trash2, Database, Scale } from 'lucide-react'

type Language = 'ua' | 'en'

export default function PrivacyPolicyPage() {
    const [lang, setLang] = useState<Language>('ua')

    const content = {
        ua: {
            title: 'Політика конфіденційності',
            subtitle: 'Ми цінуємо вашу приватність та прозоро описуємо, як працюємо з вашими даними.',
            lastUpdated: 'Останнє оновлення: 10 травня 2026 р.',
            sections: [
                {
                    title: '1. Дані, які ми збираємо',
                    icon: <Database size={20} />,
                    content: [
                        'Персональні дані: Ім\'я, Email, номер телефону. Соціальні мережі (опціонально).',
                        'Верифікація волонтера: Фото документа та назва організації.',
                        'Контент: Фотографії в заявках та звітах.',
                        'Технічні дані: HTTP-only cookies для авторизації, геолокація (за вашим вибором).'
                    ]
                },
                {
                    title: '2. Використання інформації',
                    icon: <Eye size={20} />,
                    content: [
                        'Ідентифікація та верифікація користувачів.',
                        'Відображення заявок на інтерактивній мапі.',
                        'Забезпечення роботи чату в реальному часі.',
                        'Надсилання системних повідомлень про статус допомоги.'
                    ]
                },
                {
                    title: '3. Безпека та зберігання',
                    icon: <Lock size={20} />,
                    content: [
                        'Всі дані зберігаються у хмарі Microsoft Azure.',
                        'Паролі шифруються за допомогою сучасних алгоритмів із використанням унікальної солі.',
                        'Ми використовуємо HTTP-only cookies для захисту від XSS атак.'
                    ]
                },
                {
                    title: '4. Видалення та анонімізація',
                    icon: <Trash2 size={20} />,
                    content: [
                        'Ви можете видалити свій профіль у будь-який час.',
                        'Для збереження цілісності історії допомоги, ваші дані будуть анонімізовані.',
                        'Після анонімізації ніхто не зможе пов\'язати ваші минулі дії з вашою особою.'
                    ]
                },
                {
                    title: '5. Ваші права (GDPR)',
                    icon: <Scale size={20} />,
                    content: [
                        'Право на доступ до своїх даних.',
                        'Право на виправлення помилок.',
                        'Право на повне видалення персональної інформації.',
                        'Право на відкликання згоди на обробку.'
                    ]
                }
            ],
            footer: 'З будь-яких питань щодо приватності звертайтесь:'
        },
        en: {
            title: 'Privacy Policy',
            subtitle: 'We value your privacy and describe transparently how we handle your data.',
            lastUpdated: 'Last Updated: May 10, 2026',
            sections: [
                {
                    title: '1. Information We Collect',
                    icon: <Database size={20} />,
                    content: [
                        'Personal Data: Name, Email, phone number. Social media (optional).',
                        'Volunteer Verification: ID document photo and organization name.',
                        'Content: Photos in requests and reports.',
                        'Technical Data: HTTP-only cookies for auth, geolocation (optional).'
                    ]
                },
                {
                    title: '2. How We Use Information',
                    icon: <Eye size={20} />,
                    content: [
                        'Identification and verification of users.',
                        'Displaying requests on the interactive map.',
                        'Facilitating real-time chat functionality.',
                        'Sending system notifications regarding help status.'
                    ]
                },
                {
                    title: '3. Security and Storage',
                    icon: <Lock size={20} />,
                    content: [
                        'All data is stored in the Microsoft Azure cloud.',
                        'Passwords are encrypted using modern algorithms with a unique salt.',
                        'We use HTTP-only cookies to protect against XSS attacks.'
                    ]
                },
                {
                    title: '4. Deletion and Anonymization',
                    icon: <Trash2 size={20} />,
                    content: [
                        'You can delete your profile at any time.',
                        'To maintain the integrity of help history, your data will be anonymized.',
                        'After anonymization, no one can link your past actions back to you.'
                    ]
                },
                {
                    title: '5. Your Rights (GDPR)',
                    icon: <Scale size={20} />,
                    content: [
                        'Right to access your data.',
                        'Right to rectify errors.',
                        'Right to full erasure of personal information.',
                        'Right to withdraw consent at any time.'
                    ]
                }
            ],
            footer: 'For any privacy-related questions, please contact:'
        }
    }

    const t = content[lang]

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-ink mb-2 tracking-tight">{t.title}</h1>
                    <p className="text-ink-soft font-medium">{t.subtitle}</p>
                    <p className="text-xs text-primary font-bold mt-2 uppercase tracking-widest">{t.lastUpdated}</p>
                </div>
                
                <button 
                    onClick={() => setLang(l => l === 'ua' ? 'en' : 'ua')}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl hover:border-primary/50 transition-all shadow-sm font-bold text-sm"
                >
                    <Globe size={18} />
                    {lang === 'ua' ? 'English' : 'Українська'}
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={lang}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                >
                    {t.sections.map((section, idx) => (
                        <div key={idx} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    {section.icon}
                                </div>
                                <h2 className="text-xl font-bold text-ink">{section.title}</h2>
                            </div>
                            <ul className="grid md:grid-cols-2 gap-4">
                                {section.content.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-ink-soft leading-relaxed">
                                        <span className="text-primary font-bold">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>

            <div className="mt-12 p-8 bg-primary/5 border border-primary/10 rounded-3xl text-center">
                <p className="text-ink font-bold mb-4">{t.footer}</p>
                <a href="mailto:privacy@ethy.org" className="text-primary font-black text-xl hover:underline flex items-center justify-center gap-2">
                    <Mail size={20} />
                    privacy@ethy.org
                </a>
            </div>
        </div>
    )
}
