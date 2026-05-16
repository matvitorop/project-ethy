import { useEffect, useRef, useState, useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import { ArrowLeft, ListChecks, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { GET_CHAT_MESSAGES, GET_STAGES } from '../../api/queries'
import type { ChatMessagesData, ChatListItem, StagesData } from '../../api/types'
import { useChatSignalR } from './useChatSignalR'
import { getChatConnection } from '../../api/chatHub'
import * as signalR from '@microsoft/signalr'
import ProposeStageModal from './ProposeStageModal'
import RejectStageModal from './RejectStageModal'
import StageCard from './StageCard'
import { addToast } from '../../store/uiSlice'
import { formatDateTime } from '../../hooks/useDateTime'

interface ChatConversationProps {
    chat: ChatListItem
    onBack: () => void
}

export default function ChatConversation({ chat, onBack }: ChatConversationProps) {
    const userId = useAppSelector(s => s.auth.userId)
    const dispatch = useAppDispatch()
    
    const { connected, liveMessages, liveStages } = useChatSignalR(chat.helpRequestId)
    
    const [input, setInput] = useState('')
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
                setProposeModalOpen(false)
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
                                        {formatDateTime(msg.createdAtUtc, 'timeOnly')}
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
