import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import { GET_NOTIFICATIONS, MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from '../../api/queries'
import { getNotificationConnection, startNotificationConnection } from '../../api/notificationHub'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToast } from '../../store/uiSlice'
import type { Notification, GetNotificationsData } from '../../api/types'
import { NotificationContext } from './NotificationContext'

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const userId = useAppSelector(state => state.auth.userId)
    const activeChatId = useAppSelector(state => state.ui.activeChatId)
    const activeChatIdRef = useRef(activeChatId)
    const dispatch = useAppDispatch()
    const client = useApolloClient()
    
    const [liveNotifications, setLiveNotifications] = useState<Notification[]>([])
    
    useEffect(() => {
        activeChatIdRef.current = activeChatId
    }, [activeChatId])

    const [markReadMutation] = useMutation(MARK_NOTIFICATION_AS_READ)
    const [markAllReadMutation] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ)

    const { data, loading } = useQuery<GetNotificationsData>(GET_NOTIFICATIONS, {
        variables: { limit: 50 },
        skip: !userId,
        fetchPolicy: 'cache-and-network'
    })

    const notifications = useMemo(() => {
        const initial = data?.notificationQuery?.notifications?.data ?? []
        const initialIds = new Set(initial.map(n => n.id))
        const filteredLive = liveNotifications.filter(n => !initialIds.has(n.id))
        return [...filteredLive, ...initial]
    }, [data, liveNotifications])

    const handleNewNotification = useCallback((notification: Notification) => {
        const isChat = notification.type === 'Chat' || notification.type === 1
        const relatedId = notification.relatedEntityId

        if (isChat && relatedId && activeChatIdRef.current && relatedId.toLowerCase() === activeChatIdRef.current.toLowerCase()) {
            const id = notification.id
            if (id) {
                markReadMutation({ variables: { id } }).catch(() => { })
            }
            return
        }

        setLiveNotifications(prev => [notification, ...prev])

        dispatch(addToast({
            type: 'info',
            message: `${notification.title}: ${notification.content.substring(0, 50)}${notification.content.length > 50 ? '...' : ''}`
        }))
    }, [dispatch, markReadMutation])

    useEffect(() => {
        if (!userId) {
            const timer = setTimeout(() => setLiveNotifications([]), 0)
            return () => clearTimeout(timer)
        }

        let isMounted = true
        const connection = getNotificationConnection()

        const start = async () => {
            try {
                await startNotificationConnection()
                if (isMounted) {
                    connection.on('ReceiveNotification', handleNewNotification)
                }
            } catch (err) {
                console.error('SignalR Notification Error: ', err)
            }
        }

        start()

        return () => {
            isMounted = false
            connection.off('ReceiveNotification')
        }
    }, [userId, handleNewNotification])

    const markAsRead = async (id: string) => {
        try {
            await markReadMutation({ variables: { id } })
            
            // Update live notifications
            setLiveNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            )

            // Update Apollo cache for initial notifications
            client.cache.modify({
                id: client.cache.identify({ __typename: 'Notification', id }),
                fields: {
                    isRead() { return true }
                }
            })
        } catch (err) {
            console.error('Failed to mark notification as read:', err)
        }
    }

    const markAllAsRead = async () => {
        try {
            await markAllReadMutation()
            setLiveNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            
            // Refetch or update cache for all. Refetch is easier for "all"
            client.refetchQueries({ include: [GET_NOTIFICATIONS] })
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err)
        }
    }

    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications])

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    )
}
