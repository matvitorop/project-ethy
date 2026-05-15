import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { closeChatPanel, openChat } from '../../store/uiSlice'
import { stopChatConnection, getChatConnection } from '../../api/chatHub'
import type { ChatListItem } from '../../api/types'
import ChatList from './ChatList'
import ChatConversation from './ChatConversation'

export default function ChatPanel() {
    const dispatch = useAppDispatch()
    const isOpen = useAppSelector(s => s.ui.chatPanelOpen)
    const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null)

    const handleClose = () => {
        dispatch(closeChatPanel())
        setSelectedChat(null)
        stopChatConnection()
    }

    const handleBack = () => {
        const conn = getChatConnection()
        if (selectedChat) {
            conn.invoke('LeaveChat', selectedChat.helpRequestId).catch(() => { })
            dispatch(openChat(null))
        }
        setSelectedChat(null)
    }

    const handleSelectChat = (chat: ChatListItem) => {
        setSelectedChat(chat)
        dispatch(openChat(chat.chatId))
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-[360px] bg-surface border-l border-border z-[70] flex flex-col shadow-2xl overflow-hidden"
                    >
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-surface relative z-10">
                            <h2 className="text-xl font-black text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>
                                {selectedChat ? 'Переписка' : 'Повідомлення'}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-ink-soft hover:text-error hover:bg-error/5 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                {selectedChat ? (
                                    <motion.div
                                        key="chat"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="h-full"
                                    >
                                        <ChatConversation chat={selectedChat} onBack={handleBack} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="list"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <ChatList onSelectChat={handleSelectChat} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}