import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { X, Send, ArrowLeft, MessageCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { closeChatPanel} from '../../store/uiSlice'
import { GET_MY_CHATS, GET_CHAT_MESSAGES, GET_STAGES_FOR_CHAT } from '../../api/queries'
import type { MyChatsData, ChatMessagesData, ChatMessage, ChatListItem, StagesData, StageItem, StageEvent } from '../../api/types'
import { startChatConnection, getChatConnection, stopChatConnection } from '../../api/chatHub'
import * as signalR from '@microsoft/signalr'
import { ListChecks } from 'lucide-react'
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
function ChatList({
  onSelectChat,
}: {
  onSelectChat: (chat: ChatListItem) => void
}) {
  const { data, loading } = useQuery<MyChatsData>(GET_MY_CHATS, {
    fetchPolicy: 'network-only',
  })

  const items = data?.helpRequestQuer.myChats.items ?? []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <MessageCircle size={32} className="text-ink-soft mx-auto mb-3" />
        <p className="text-ink-muted text-sm">Активних чатів немає</p>
        <p className="text-ink-soft text-xs mt-1">
          Чат з'являється після призначення виконавця
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {items.map(chat => (
        <button
          key={chat.chatId}
          onClick={() => onSelectChat(chat)}
          className="w-full text-left px-4 py-3 hover:bg-surface-muted transition-colors"
        >
          <p className="text-sm font-medium text-ink truncate">
            {chat.helpRequestTitle}
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            Натисніть щоб відкрити переписку
          </p>
        </button>
      ))}
    </div>
  )
}

// ============ Переписка ============
function ChatConversation({
    chat,
    onBack,
}: {
    chat: ChatListItem
    onBack: () => void
}) {
    const userId = useAppSelector(s => s.auth.userId)
    const dispatch = useAppDispatch()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [stages, setStages] = useState<StageItem[]>([])
    const [input, setInput] = useState('')
    const [connected, setConnected] = useState(false)
    const [proposeModalOpen, setProposeModalOpen] = useState(false)
    const [rejectModalOpen, setRejectModalOpen] = useState(false)
    const [rejectingStageId, setRejectingStageId] = useState<string | null>(null)
    const [proposing, setProposing] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    // Завантаження повідомлень
    const { data: messagesData } = useQuery<ChatMessagesData>(GET_CHAT_MESSAGES, {
        variables: { helpRequestId: chat.helpRequestId },
        fetchPolicy: 'network-only',
    })

    // Завантаження етапів
    const { data: stagesData } = useQuery<StagesData>(GET_STAGES_FOR_CHAT, {
        variables: { helpRequestId: chat.helpRequestId },
        fetchPolicy: 'network-only',
    })

    useEffect(() => {
        const items = messagesData?.helpRequestQuer.chatMessages.messages ?? []
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(items)
    }, [messagesData])

    useEffect(() => {
        const items = stagesData?.helpRequestQuer.stages.items ?? []
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStages(items)
    }, [stagesData])

    // SignalR підключення
    useEffect(() => {
        let mounted = true

        const connect = async () => {
            try {
                await startChatConnection()
                const conn = getChatConnection()

                let attempts = 0
                while (conn.state !== signalR.HubConnectionState.Connected && attempts < 10) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                    attempts++
                }

                if (conn.state !== signalR.HubConnectionState.Connected) return

                await conn.invoke('JoinChat', chat.helpRequestId)

                conn.off('ReceiveMessage')
                conn.on('ReceiveMessage', (msg: ChatMessage) => {
                    if (mounted) setMessages(prev => [...prev, msg])
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
                        setStages(prev => [...prev, newStage])
                        setProposeModalOpen(false)
                    }
                })

                conn.off('StageConfirmed')
                conn.on('StageConfirmed', (event: StageEvent) => {
                    if (mounted) {
                        setStages(prev => prev.map(s =>
                            s.id === event.stageId ? { ...s, status: 1 } : s
                        ))
                        apolloClient.refetchQueries({
                            include: ['GetStages', 'GetEventLog']
                        })
                    }
                })

                conn.off('StageRejected')
                conn.on('StageRejected', (event: StageEvent) => {
                    if (mounted) {
                        setStages(prev => prev.map(s =>
                            s.id === event.stageId
                                ? { ...s, status: 2, rejectionReason: event.reason ?? null }
                                : s
                        ))
                        apolloClient.refetchQueries({
                            include: ['GetStages', 'GetEventLog']
                        })
                    }
                })

                conn.off('StageDeleted')
                conn.on('StageDeleted', (event: StageEvent) => {
                    if (mounted) {
                        setStages(prev => prev.filter(s => s.id !== event.stageId))
                    }
                })

                conn.off('Error')
                conn.on('Error', (code: string, message: string) => {
                    console.error('SignalR Hub Error:', code, message)
                    const ukrainianMessages: Record<string, string> = {
                        'HelpRequestStage.PENDING_EXISTS': 'Вже є активний етап який очікує підтвердження',
                    }
                    dispatch(addToast({
                        type: 'error',
                        message: ukrainianMessages[code] ?? message
                    }))
                })

                if (mounted) setConnected(true)
            } catch (err) {
                console.error('SignalR connection error:', err)
            }
        }

        connect()

        return () => {
            mounted = false
            const conn = getChatConnection()
            conn.off('ReceiveMessage')
            conn.off('StageProposed')
            conn.off('StageConfirmed')
            conn.off('StageRejected')
            conn.off('StageDeleted')
            conn.off('Error')
            conn.invoke('LeaveChat', chat.helpRequestId).catch(() => { })
        }
    }, [chat.helpRequestId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, stages])

    const handleSend = async () => {
        if (!input.trim()) return
        try {
            const conn = getChatConnection()
            if (conn.state !== signalR.HubConnectionState.Connected) return
            await conn.invoke('SendMessage', chat.helpRequestId, input.trim())
            setInput('')
        } catch (err) {
            console.error('Send message error:', err)
        }
    }

    const handleProposeStage = async (content: string) => {
        setProposing(true)
        try {
            const conn = getChatConnection()
            if (conn.state !== signalR.HubConnectionState.Connected) return
            await conn.invoke('ProposeStage', chat.helpRequestId, chat.chatId, content)
            // Модал закриється тільки після отримання StageProposed
        } catch (err) {
            console.error('ProposeStage error:', err)
            dispatch(addToast({ type: 'error', message: 'Помилка при пропозиції етапу' }))
        } finally {
            setProposing(false)
        }
    }

    const handleConfirmStage = async (stageId: string) => {
        setConfirming(true)
        try {
            const conn = getChatConnection()
            if (conn.state !== signalR.HubConnectionState.Connected) return
            await conn.invoke('ConfirmStage', chat.helpRequestId, stageId)
        } catch (err) {
            console.error('ConfirmStage error:', err)
        } finally {
            setConfirming(false)
        }
    }

    const handleRejectStage = async (reason: string) => {
        if (!rejectingStageId) return
        setConfirming(true)
        try {
            const conn = getChatConnection()
            if (conn.state !== signalR.HubConnectionState.Connected) return
            await conn.invoke('RejectStage', chat.helpRequestId, rejectingStageId, reason)
            setRejectModalOpen(false)
            setRejectingStageId(null)
        } catch (err) {
            console.error('RejectStage error:', err)
        } finally {
            setConfirming(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Об'єднуємо повідомлення і pending етапи в один потік по часу
    type ChatItem =
        | { type: 'message'; data: ChatMessage }
        | { type: 'stage'; data: StageItem }

    const pendingStages = stages.filter(s => s.status === 0)

    const chatItems: ChatItem[] = [
        ...messages.map(m => ({ type: 'message' as const, data: m })),
        ...pendingStages.map(s => ({ type: 'stage' as const, data: s })),
    ].sort((a, b) => {
        const aTime = a.type === 'message' ? a.data.createdAtUtc : a.data.createdAtUtc
        const bTime = b.type === 'message' ? b.data.createdAtUtc : b.data.createdAtUtc
        return new Date(aTime).getTime() - new Date(bTime).getTime()
    })

    return (
        <div className="flex flex-col h-full">
            {/* Заголовок */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <button onClick={onBack} className="text-ink-muted hover:text-ink transition-colors">
                    <ArrowLeft size={16} />
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{chat.helpRequestTitle}</p>
                    <p className="text-xs text-ink-muted">
                        {connected ? 'Підключено' : 'Підключення...'}
                    </p>
                </div>
            </div>

            {/* Повідомлення */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatItems.length === 0 && (
                    <div className="text-center py-8 text-ink-muted text-sm">
                        Повідомлень поки немає
                    </div>
                )}

                {chatItems.map((item) => {
                    if (item.type === 'message') {
                        const msg = item.data
                        const isMe = msg.senderId === userId
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${isMe
                                        ? 'bg-primary text-white rounded-br-sm'
                                        : 'bg-surface-muted text-ink border border-border rounded-bl-sm'
                                    }`}>
                                    <p className="leading-relaxed">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-ink-muted'}`}>
                                        {formatTime(msg.createdAtUtc)}
                                    </p>
                                </div>
                            </div>
                        )
                    }

                    const stage = item.data
                    return (
                        <StageCard
                            key={stage.id}
                            stageId={stage.id}
                            content={stage.content}
                            status={stage.status}
                            proposedByUserId={stage.proposedByUserId}
                            rejectionReason={stage.rejectionReason}
                            currentUserId={userId}
                            onConfirm={handleConfirmStage}
                            onReject={(stageId) => {
                                setRejectingStageId(stageId)
                                setRejectModalOpen(true)
                            }}
                            confirming={confirming}
                        />
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Поле вводу */}
            <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <button
                        onClick={() => setProposeModalOpen(true)}
                        disabled={!connected}
                        className="p-2 border border-border rounded-lg text-ink-muted hover:text-primary hover:border-primary disabled:opacity-50 transition-colors flex-shrink-0"
                        title="Запропонувати етап"
                    >
                        <ListChecks size={16} />
                    </button>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Написати повідомлення..."
                        rows={1}
                        className="flex-1 px-3 py-2 bg-surface-muted border border-border rounded-lg text-sm text-ink placeholder-ink-soft focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || !connected}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors flex-shrink-0"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-xs text-ink-soft mt-1">
                    Enter — надіслати, Shift+Enter — новий рядок
                </p>
            </div>

            {/* Модали */}
            <ProposeStageModal
                isOpen={proposeModalOpen}
                onClose={() => setProposeModalOpen(false)}
                onPropose={handleProposeStage}
                loading={proposing}
            />
            <RejectStageModal
                isOpen={rejectModalOpen}
                onClose={() => {
                    setRejectModalOpen(false)
                    setRejectingStageId(null)
                }}
                onReject={handleRejectStage}
                loading={confirming}
            />
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

  const handleSelectChat = (chat: ChatListItem) => {
    setSelectedChat(chat)
  }

  const handleBack = () => {
    setSelectedChat(null)
    const conn = getChatConnection()
    if (selectedChat) {
      conn.invoke('LeaveChat', selectedChat.helpRequestId).catch(() => {})
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={handleClose}
      />

      {/* Панель */}
      <div className="fixed right-0 top-0 h-full w-80 bg-surface border-l border-border z-50 flex flex-col shadow-xl">
        {/* Заголовок */}
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-ink"
              style={{ fontFamily: 'Jua, sans-serif' }}>
            {selectedChat ? 'Переписка' : 'Чати'}
          </h2>
            <button
                onClick={handleClose}    
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
            >
                <X size={16} />
            </button>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-hidden">
          {selectedChat ? (
            <ChatConversation
              chat={selectedChat}
              onBack={handleBack}
            />
          ) : (
            <ChatList onSelectChat={handleSelectChat} />
          )}
        </div>
      </div>
    </>
  )
}