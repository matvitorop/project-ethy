import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, MessageCircle, AlertTriangle, HandHelping } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from './useNotifications';
import type { Notification } from '../../api/types';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { openChat } from '../../store/uiSlice';
import { useRelativeTime } from '../../hooks/useRelativeTime';

// Окремий компонент для елемента сповіщення, щоб використовувати хук часу
function NotificationItem({ 
    notification, 
    onClick, 
    onMarkRead,
    getIcon 
}: { 
    notification: Notification; 
    onClick: () => void; 
    onMarkRead: (e: React.MouseEvent) => void;
    getIcon: (type: Notification['type']) => React.ReactNode;
}) {
    const date = notification.createdAtUtc ? new Date(notification.createdAtUtc) : null;
    const timeAgo = useRelativeTime(date);

    return (
        <div
            onClick={onClick}
            className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-all flex gap-3 border-b border-border/50 last:border-0 cursor-pointer group relative ${!notification.isRead ? 'bg-primary/[0.02]' : 'opacity-70'}`}
        >
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${!notification.isRead ? 'bg-primary/10' : 'bg-surface-muted'}`}>
                {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-xs truncate ${!notification.isRead ? 'font-black text-ink' : 'font-bold text-ink-muted'}`}>
                        {notification.title}
                    </p>
                    <span className="text-[9px] font-bold text-ink-soft whitespace-nowrap">
                        {timeAgo}
                    </span>
                </div>
                <p className="text-[11px] font-medium text-ink-muted line-clamp-2 leading-relaxed">
                    {notification.content}
                </p>
            </div>
            
            {!notification.isRead && (
                <div className="flex flex-col items-center justify-between shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1 group-hover:hidden" />
                    <button
                        onClick={onMarkRead}
                        className="hidden group-hover:flex w-5 h-5 bg-success/10 text-success rounded-full items-center justify-center hover:bg-success hover:text-white transition-all"
                        title="Позначити як прочитане"
                    >
                        <Check size={10} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Стейт для розмірів вікна
    const [dimensions, setDimensions] = useState(() => {
        const saved = localStorage.getItem('notification-dropdown-size');
        return saved ? JSON.parse(saved) : { width: 320, height: 400 };
    });

    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Логіка ресайзу
    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!dropdownRef.current) return;
            const rect = dropdownRef.current.getBoundingClientRect();
            
            // Розраховуємо нові розміри (dropdown відкривається вліво-вниз від кнопки)
            const newWidth = Math.max(280, Math.min(500, rect.right - e.clientX));
            const newHeight = Math.max(200, Math.min(600, e.clientY - rect.top));

            const newDims = { width: newWidth, height: newHeight };
            setDimensions(newDims);
            localStorage.setItem('notification-dropdown-size', JSON.stringify(newDims));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        
        // Закриваємо тільки якщо є куди переходити
        if (notification.relatedEntityId) {
            setIsOpen(false);
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
                        style={{ width: dimensions.width, height: dimensions.height }}
                        className="absolute right-0 mt-3 bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden z-[100] flex flex-col"
                    >
                        <div className="px-4 py-3 border-b border-border bg-surface-muted/50 flex items-center justify-between shrink-0">
                            <span className="text-xs font-black uppercase tracking-widest text-ink" style={{ fontFamily: 'Jua, sans-serif' }}>Сповіщення</span>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                                    className="text-[10px] font-black uppercase text-primary hover:text-primary-light flex items-center gap-1 transition-colors"
                                >
                                    <Check size={12} /> Позначити всі
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-12 h-12 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell size={20} className="text-ink-muted/30" />
                                    </div>
                                    <p className="text-xs text-ink-soft font-bold">У вас поки немає сповіщень</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <NotificationItem 
                                        key={notification.id}
                                        notification={notification}
                                        getIcon={getIcon}
                                        onClick={() => handleNotificationClick(notification)}
                                        onMarkRead={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                        
                        {/* Футер для запобігання перекриттю ресайз-ручки */}
                        <div className="h-4 bg-surface-muted/30 border-t border-border/50 shrink-0" />

                        {/* Ручка для ресайзу */}
                        <div 
                            className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-[110]"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setIsResizing(true);
                            }}
                        >
                            <div className="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-ink-soft/30 rounded-bl-sm" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
