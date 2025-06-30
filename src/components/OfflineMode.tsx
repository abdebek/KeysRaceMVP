import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Wifi, Download, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function OfflineMode() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineNotice) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-amber-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
        <WifiOff className="w-5 h-5" />
        <span className="font-medium">{t('offlineMode.youreOffline')}</span>
        <span className="text-amber-100">{t('offlineMode.localFeaturesWork')}</span>
      </div>
    </motion.div>
  );
}