import { useEffect, useRef, useState, useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import { X, Send, ArrowLeft, MessageCircle, ListChecks, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { closeChatPanel, openChat } from '../../store/uiSlice'
import { GET_MY_CHATS, GET_CHAT_MESSAGES, GET_STAGES } from '../../api/queries'
import type { MyChatsData, ChatMessagesData, ChatMessage, ChatListItem, StagesData, StageItem, StageEvent } from '../../api/types'
import { startChatConnection, getChatConnection, stopChatConnection } from '../../api/chatHub'
import * as signalR from '@microsoft/signalr'
import ProposeStageModal from './ProposeStageModal'
import RejectStageModal from './RejectStageModal'
import StageCard from './StageCard'
import { addToast } from '../../store/uiSlice'
import { apolloClient } from '../../api/ApolloClient'

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

// ============ Список чатів ============
function ChatList({ onSelectChat }: { onSelectChat: (chat: ChatListItem) => void }) {
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

// ============ Переписка ============
function ChatConversation({ chat, onBack }: { chat: ChatListItem; onBack: () => void }) {
    const userId = useAppSelector(s => s.auth.userId)
    const dispatch = useAppDispatch()
    
    const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([])
    const [liveStages, setLiveStages] = useState<StageItem[]>([])
    
    const [input, setInput] = useState('')
    const [connected, setConnected] = useState(false)
    const [proposeModalOpen, setProposeModalOpen] = useState(false)
    const [rejectModalOpen, setRejectModalOpen] = useState(false)
    const [rejectingStageId, setRejectingStageId] = useState<string | null>(null)
    const [proposing, setProposing] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    const { data: messagesData } = useQuery<ChatMessagesData>(GET_CHAT_MESSAGES, {
        variables: { helpRequestId: chat.helpRequestId },
        fetchPolicy: 'network-only'
    })

    const { data: stagesData } = useQuery<StagesData>(GET_STAGES, {
        variables: { helpRequestId: chat.helpRequestId },
        fetchPolicy: 'network-only'
    })

    const messages = useMemo(() => {
        const initial = messagesData?.helpRequestQuer.chatMessages.messages || []
        const initialIds = new Set(initial.map(m => m.id))
        const filteredLive = liveMessages.filter(m => !initialIds.has(m.id))
        return [...initial, ...filteredLive]
    }, [messagesData, liveMessages])

    const stages = useMemo(() => {
        const initial = stagesData?.helpRequestQuer.stages.items || []
        const initialIds = new Set(initial.map(s => s.id))
        const filteredLive = liveStages.filter(s => !initialIds.has(s.id))
        return [...initial, ...filteredLive]
    }, [stagesData, liveStages])

    useEffect(() => {
        let mounted = true
        const connect = async () => {
            try {
                await startChatConnection()
                const conn = getChatConnection()
                let attempts = 0
                while (conn.state !== signalR.HubConnectionState.Connected && attempts < 10) {
                    await new Promise(res => setTimeout(res, 100))
                    attempts++
                }
                if (conn.state !== signalR.HubConnectionState.Connected) return
                await conn.invoke('JoinChat', chat.helpRequestId)

                conn.off('ReceiveMessage')
                conn.on('ReceiveMessage', (msg: ChatMessage) => {
                    if (mounted) setLiveMessages(prev => [...prev, msg])
                })

                conn.off('StageProposed')
                conn.on('StageProposed', (event: StageEvent) => {
                    if (mounted) {
                        const newStage: StageItem = {
                            id: event.stageId,
                            proposedByUserId: event.proposedByUserId ?? '',
                            content: event.content ?? '',
                            status: 0,
                            rejectionReason: null,
                            createdAtUtc: event.createdAtUtc ?? new Date().toISOString(),
                            resolvedAtUtc: null,
                        }
                        setLiveStages(prev => [...prev, newStage])
                        setProposeModalOpen(false)
                    }
                })

                conn.off('StageConfirmed')
                conn.on('StageConfirmed', (event: StageEvent) => {
                    if (mounted) {
                        setLiveStages(prev => prev.map(s => s.id === event.stageId ? { ...s, status: 1 } : s))
                        apolloClient.refetchQueries({ include: [GET_STAGES] })
                    }
                })

                conn.off('StageRejected')
                conn.on('StageRejected', (event: StageEvent) => {
                    if (mounted) {
                        setLiveStages(prev => prev.map(s => s.id === event.stageId ? { ...s, status: 2, rejectionReason: event.reason ?? null } : s))
                        apolloClient.refetchQueries({ include: [GET_STAGES] })
                    }
                })

                conn.off('StageDeleted')
                conn.on('StageDeleted', (event: StageEvent) => {
                    if (mounted) setLiveStages(prev => prev.filter(s => s.id !== event.stageId))
                })

                conn.off('Error')
                conn.on('Error', (code, message) => {
                    const ukMsg: Record<string, string> = { 'HelpRequestStage.PENDING_EXISTS': 'Вже є активний етап' }
                    dispatch(addToast({ type: 'error', message: ukMsg[code] ?? message }))
                })

                if (mounted) setConnected(true)
            } catch { console.error('SignalR connection failed') }
        }
        connect()
        return () => {
            mounted = false
            const conn = getChatConnection()
            conn.off('ReceiveMessage'); conn.off('StageProposed'); conn.off('StageConfirmed')
            conn.off('StageRejected'); conn.off('StageDeleted'); conn.off('Error')
            conn.invoke('LeaveChat', chat.helpRequestId).catch(() => { })
        }
    }, [chat.helpRequestId, dispatch])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, stages])

    const handleSend = async () => {
        if (!input.trim()) return
        try {
            const conn = getChatConnection()
            if (conn.state === signalR.HubConnectionState.Connected) {
                await conn.invoke('SendMessage', chat.helpRequestId, input.trim())
                setInput('')
            }
        } catch { console.error('SignalR error') }
    }

    const handleProposeStage = async (content: string) => {
        setProposing(true)
        try {
            const conn = getChatConnection()
            if (conn.state === signalR.HubConnectionState.Connected) {
                await conn.invoke('ProposeStage', chat.helpRequestId, chat.chatId, content)
            }
        } catch {
            dispatch(addToast({ type: 'error', message: 'Помилка пропозиції' }))
        } finally { setProposing(false) }
    }

    const handleConfirmStage = async (stageId: string) => {
        setConfirming(true)
        try {
            const conn = getChatConnection()
            if (conn.state === signalR.HubConnectionState.Connected) {
                await conn.invoke('ConfirmStage', chat.helpRequestId, stageId)
            }
        } catch (err) { console.error(err) } finally { setConfirming(false) }
    }

    const handleRejectStage = async (reason: string) => {
        if (!rejectingStageId) return
        setConfirming(true)
        try {
            const conn = getChatConnection()
            if (conn.state === signalR.HubConnectionState.Connected) {
                await conn.invoke('RejectStage', chat.helpRequestId, rejectingStageId, reason)
                setRejectModalOpen(false); setRejectingStageId(null)
            }
        } catch (err) { console.error(err) } finally { setConfirming(false) }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    const chatItems = useMemo(() => {
        return [
            ...messages.map(m => ({ type: 'message' as const, data: m })),
            ...stages.filter(s => s.status === 0).map(s => ({ type: 'stage' as const, data: s })),
        ].sort((a, b) => new Date(a.data.createdAtUtc).getTime() - new Date(b.data.createdAtUtc).getTime())
    }, [messages, stages])

    return (
        <div className="flex flex-col h-full bg-surface-muted/30">
            <div className="px-4 py-3 bg-surface border-b border-border flex items-center gap-3 shadow-sm">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-muted text-ink-soft hover:text-primary transition-all">
                    <ArrowLeft size={16} />
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-ink truncate leading-tight">{chat.helpRequestTitle}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-ink-soft'}`} />
                        <p className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">
                            {connected ? 'Онлайн' : 'Підключення...'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {chatItems.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-[10px] font-black text-ink-soft uppercase tracking-widest">Повідомлень поки немає</p>
                    </div>
                )}

                {chatItems.map((item) => {
                    if (item.type === 'message') {
                        const msg = item.data
                        const isMe = msg.senderId === userId
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={`msg-${msg.id}`}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm relative group ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-surface border border-border text-ink rounded-bl-none'
                                    }`}>
                                    <p className="text-sm font-medium leading-relaxed break-words">{msg.content}</p>
                                    <p className={`text-[9px] font-bold uppercase mt-1 opacity-60 ${isMe ? 'text-white' : 'text-ink-soft'}`}>
                                        {formatTime(msg.createdAtUtc)}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    }

                    const stage = item.data
                    return (
                        <div key={`stage-${stage.id}`} className="px-1">
                            <StageCard
                                stageId={stage.id}
                                content={stage.content}
                                status={stage.status}
                                proposedByUserId={stage.proposedByUserId}
                                rejectionReason={stage.rejectionReason}
                                currentUserId={userId || ''}
                                onConfirm={handleConfirmStage}
                                onReject={(id) => { setRejectingStageId(id); setRejectModalOpen(true) }}
                                confirming={confirming}
                            />
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 bg-surface border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-end gap-2 bg-surface-muted border border-border rounded-2xl p-1.5 focus-within:border-primary/50 transition-colors shadow-inner">
                    <button
                        onClick={() => setProposeModalOpen(true)}
                        disabled={!connected}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-ink-soft hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50 shrink-0"
                        title="Запропонувати етап"
                    >
                        <ListChecks size={20} />
                    </button>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Повідомлення..."
                        rows={1}
                        className="flex-1 px-2 py-2.5 bg-transparent border-none text-sm font-medium text-ink placeholder-ink-soft/60 focus:outline-none resize-none max-h-32"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || !connected}
                        className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary-light disabled:opacity-50 transition-all shadow-md shadow-primary/20 shrink-0"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            <ProposeStageModal isOpen={proposeModalOpen} onClose={() => setProposeModalOpen(false)} onPropose={handleProposeStage} loading={proposing} />
            <RejectStageModal isOpen={rejectModalOpen} onClose={() => { setRejectModalOpen(false); setRejectingStageId(null) }} onReject={handleRejectStage} loading={confirming} />
        </div>
    )
}

// ============ Головна панель ============
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