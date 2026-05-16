import { useEffect, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { getChatConnection, startChatConnection } from '../../api/chatHub'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import { apolloClient } from '../../api/ApolloClient'
import { GET_STAGES } from '../../api/queries'
import type { ChatMessage, StageItem, StageEvent } from '../../api/types'

export function useChatSignalR(helpRequestId: string) {
    const dispatch = useAppDispatch()
    const [connected, setConnected] = useState(false)
    const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([])
    const [liveStages, setLiveStages] = useState<StageItem[]>([])

    useEffect(() => {
        let mounted = true
        const connect = async () => {
            try {
                await startChatConnection()
                const conn = getChatConnection()
                let attempts = 0
                
                // Чекаємо підключення
                while (conn.state !== signalR.HubConnectionState.Connected && attempts < 10) {
                    await new Promise(res => setTimeout(res, 100))
                    attempts++
                }
                
                if (conn.state !== signalR.HubConnectionState.Connected) return
                
                await conn.invoke('JoinChat', helpRequestId)

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
            } catch { 
                console.error('SignalR connection failed') 
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
            conn.invoke('LeaveChat', helpRequestId).catch(() => { })
        }
    }, [helpRequestId, dispatch])

    return {
        connected,
        liveMessages,
        liveStages,
        setLiveMessages,
        setLiveStages
    }
}
