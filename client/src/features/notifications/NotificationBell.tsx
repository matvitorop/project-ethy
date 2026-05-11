import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, MessageCircle, AlertTriangle, HandHelping } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from './NotificationContext';
import type { Notification } from './NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { openChat } from '../../store/uiSlice';

const formatTime = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'щойно';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} хв тому`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} год тому`;
        return date.toLocaleDateString('uk-UA');
    } catch {
        return '';
    }
};

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        
        setIsOpen(false);

        if (notification.relatedEntityId) {
            if (notification.relatedEntityType === 'HelpRequest') {
                navigate(`/requests/${notification.relatedEntityId}`);
            } else if (notification.relatedEntityType === 'Chat') {
                navigate('/requests');
                dispatch(openChat(notification.relatedEntityId));
            }
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'Chat': return <MessageCircle size={14} className="text-blue-500" />;
            case 'HelpRequest': return <HandHelping size={14} className="text-primary" />;
            case 'Warning': return <AlertTriangle size={14} className="text-error" />;
            default: return <Info size={14} className="text-ink-muted" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-ink-muted hover:text-primary hover:bg-primary/5 transition-all relative group"
                title="Сповіщення"
            >
                <Bell size={18} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-surface shadow-sm"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden z-[100]"
                    >
                        <div className="px-4 py-3 border-b border-border bg-surface-muted/50 flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-ink">Сповіщення</span>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    <Check size={10} /> Позначити всі як прочитані
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-12 h-12 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell size={20} className="text-ink-muted/30" />
                                    </div>
                                    <p className="text-xs text-ink-soft">У вас поки немає сповіщень</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-all flex gap-3 border-b border-border/50 last:border-0 ${!notification.isRead ? 'bg-primary/[0.02]' : 'opacity-70'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${!notification.isRead ? 'bg-primary/10' : 'bg-surface-muted'}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className={`text-xs truncate ${!notification.isRead ? 'font-bold text-ink' : 'font-medium text-ink-muted'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[9px] text-ink-soft whitespace-nowrap">
                                                    {formatTime(notification.createdAtUtc)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-ink-muted line-clamp-2 leading-relaxed">
                                                {notification.content}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-2 border-t border-border bg-surface-muted/30">
                            <button 
                                onClick={() => { setIsOpen(false); navigate('/profile'); }}
                                className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-ink-soft hover:text-primary transition-colors"
                            >
                                Переглянути всі в профілі
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
