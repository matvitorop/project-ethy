import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { X, Send, ArrowLeft, MessageCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { closeChatPanel} from '../../store/uiSlice'
import { GET_MY_CHATS, GET_CHAT_MESSAGES } from '../../api/queries'
import type { MyChatsData, ChatMessagesData, ChatMessage, ChatListItem } from '../../api/types'
import { startChatConnection, getChatConnection, stopChatConnection } from '../../api/chatHub'
import * as signalR from '@microsoft/signalr'

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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

    const { data } = useQuery<ChatMessagesData>(GET_CHAT_MESSAGES, {
        variables: { helpRequestId: chat.helpRequestId },
        fetchPolicy: 'network-only',
    })

    // Замість onCompleted
    useEffect(() => {
        const items = data?.helpRequestQuer.chatMessages.messages ?? []
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(items)
    }, [data])

  // SignalR підключення
  useEffect(() => {
    let mounted = true

      const connect = async () => {
          try {
              await startChatConnection()
              const conn = getChatConnection()

              // Чекаємо поки стан буде Connected
              let attempts = 0
              while (conn.state !== signalR.HubConnectionState.Connected && attempts < 10) {
                  await new Promise(resolve => setTimeout(resolve, 100))
                  attempts++
              }

              if (conn.state !== signalR.HubConnectionState.Connected) {
                  console.error('Failed to connect after waiting')
                  return
              }

              await conn.invoke('JoinChat', chat.helpRequestId)

              conn.on('ReceiveMessage', (msg: ChatMessage) => {
                  if (mounted) setMessages(prev => [...prev, msg])
              })

              if (mounted) {
                  console.log('SignalR connected!')
                  setConnected(true)
              }
          } catch (err) {
              console.error('SignalR connection error:', err)
          }
      }

    connect()

    return () => {
      mounted = false
      const conn = getChatConnection()
      conn.off('ReceiveMessage')
      conn.invoke('LeaveChat', chat.helpRequestId).catch(() => {})
    }
  }, [chat.helpRequestId])

  // Scroll до низу при нових повідомленнях
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        try {
            const conn = getChatConnection()

            if (conn.state !== signalR.HubConnectionState.Connected) {
                console.warn('Not connected')
                return
            }

            await conn.invoke('SendMessage', chat.helpRequestId, input.trim())
            setInput('')
        } catch (err) {
            console.error('Send message error:', err)
        }
    }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок чату */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">
            {chat.helpRequestTitle}
          </p>
          <p className="text-xs text-ink-muted">
            {connected ? 'Підключено' : 'Підключення...'}
          </p>
        </div>
      </div>

      {/* Повідомлення */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-ink-muted text-sm">
            Повідомлень поки немає
          </div>
        )}

        {messages.map(msg => {
            const isMe = msg.senderId === userId
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  isMe
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-surface-muted text-ink border border-border rounded-bl-sm'
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-ink-muted'}`}>
                  {formatTime(msg.createdAtUtc)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Поле вводу */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
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