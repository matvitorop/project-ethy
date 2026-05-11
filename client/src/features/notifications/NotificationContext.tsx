import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_NOTIFICATIONS, MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from '../../api/queries';
import { getNotificationConnection, startNotificationConnection } from '../../api/notificationHub';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToast, openChat } from '../../store/uiSlice';

export interface Notification {
    id: string;
    title: string;
    content: string;
    type: 'Info' | 'Chat' | 'HelpRequest' | 'Volunteer' | 'Warning';
    isRead: boolean;
    createdAtUtc: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Inline types to avoid issues with other files
interface GetNotificationsData {
    notificationQuery: {
        notifications: {
            data: Notification[] | null;
            error: any | null;
        };
    };
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const userId = useAppSelector(state => state.auth.userId);
    const activeChatId = useAppSelector(state => state.ui.activeChatId);
    const activeChatIdRef = React.useRef(activeChatId);
    
    // Keep ref in sync
    useEffect(() => {
        activeChatIdRef.current = activeChatId;
    }, [activeChatId]);

    const dispatch = useAppDispatch();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    const { data, loading } = useQuery<GetNotificationsData>(GET_NOTIFICATIONS, {
        variables: { limit: 50 },
        skip: !userId,
    });

    useEffect(() => {
        if (data?.notificationQuery?.notifications?.data) {
            setNotifications(data.notificationQuery.notifications.data);
        }
    }, [data]);

    const [markReadMutation] = useMutation(MARK_NOTIFICATION_AS_READ);
    const [markAllReadMutation] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNewNotification = useCallback((notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Use ref to check current active chat without re-registering listener
        if (notification.type === 'Chat' && notification.relatedEntityId === activeChatIdRef.current) {
            return;
        }

        dispatch(addToast({
            type: 'info',
            message: `${notification.title}: ${notification.content.substring(0, 50)}${notification.content.length > 50 ? '...' : ''}`
        }));
    }, [dispatch]);

    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            return;
        }

        const connection = getNotificationConnection();

        const start = async () => {
            try {
                await startNotificationConnection();
                connection.on('ReceiveNotification', handleNewNotification);
            } catch (err) {
                console.error('SignalR Notification Error: ', err);
            }
        };

        start();

        return () => {
            connection.off('ReceiveNotification');
        };
    }, [userId, handleNewNotification]);

    const markAsRead = async (id: string) => {
        try {
            await markReadMutation({ variables: { id } });
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error('Mark as read error:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllReadMutation();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Mark all as read error:', err);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
