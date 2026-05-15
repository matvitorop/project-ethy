import { useQuery } from '@apollo/client/react'
import { MessageCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { GET_MY_CHATS } from '../../api/queries'
import type { MyChatsData, ChatListItem } from '../../api/types'

interface ChatListProps {
    onSelectChat: (chat: ChatListItem) => void
}

export default function ChatList({ onSelectChat }: ChatListProps) {
    const { data, loading } = useQuery<MyChatsData>(GET_MY_CHATS, {
        fetchPolicy: 'network-only',
    })

    const items = data?.helpRequestQuer.myChats.items ?? []

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 size={32} className="text-primary animate-spin" />
                <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest">Завантаження...</p>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-20 px-6">
                <div className="w-16 h-16 bg-surface-muted rounded-3xl flex items-center justify-center mx-auto mb-6 text-ink-soft shadow-inner">
                    <MessageCircle size={32} />
                </div>
                <h3 className="text-lg font-black text-ink mb-2" style={{ fontFamily: 'Jua, sans-serif' }}>Чати відсутні</h3>
                <p className="text-xs text-ink-soft font-medium leading-relaxed">
                    Чати з'являться автоматично після призначення волонтера на вашу заявку.
                </p>
            </div>
        )
    }

    return (
        <div className="px-3 py-2 space-y-1">
            {items.map((chat, idx) => (
                <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={chat.chatId}
                    onClick={() => onSelectChat(chat)}
                    className="w-full text-left p-4 rounded-2xl hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
                            {chat.helpRequestTitle[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-ink truncate group-hover:text-primary transition-colors">
                                {chat.helpRequestTitle}
                            </p>
                            <p className="text-[10px] font-bold text-ink-soft uppercase tracking-widest mt-0.5">
                                Відкрити переписку
                            </p>
                        </div>
                    </div>
                </motion.button>
            ))}
        </div>
    )
}
