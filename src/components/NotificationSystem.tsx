import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
    }
  };

  const getColors = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-success-600/20 border-success-500/40 text-success-300';
      case 'error': return 'bg-error-600/20 border-error-500/40 text-error-300';
      case 'warning': return 'bg-amber-600/20 border-amber-500/40 text-amber-300';
      case 'info': return 'bg-blue-600/20 border-blue-500/40 text-blue-300';
    }
  };

  // Limit to maximum 3 notifications visible at once
  const visibleNotifications = notifications.slice(-3);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => {
          const Icon = getIcon(notification.type);
          const colors = getColors(notification.type);
          
          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
              className={`glass-card p-4 border ${colors}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-200">
                    {notification.title}
                  </h4>
                  {notification.message && (
                    <p className="text-sm text-gray-400 mt-1">
                      {notification.message}
                    </p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemove(notification.id)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing notifications with duplicate prevention
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    // Check for duplicate notifications (same title and message)
    const isDuplicate = notifications.some(n => 
      n.title === notification.title && 
      n.message === notification.message &&
      n.type === notification.type
    );

    if (isDuplicate) {
      return null; // Don't add duplicate
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => {
      // Keep only last 5 notifications to prevent memory issues
      const updated = [...prev, newNotification].slice(-5);
      return updated;
    });

    // Auto-remove after duration
    const duration = notification.duration || 3000; // Reduced default duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
}