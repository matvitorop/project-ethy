import { createContext } from 'react'
import type { Notification } from '../../api/types'

export interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    loading: boolean
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)
