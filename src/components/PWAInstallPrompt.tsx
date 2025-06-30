import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already dismissed
  if (localStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        >
          <div className="glass-card p-4 border border-primary-500/30">
            <div className="flex items-start space-x-3">
              <div className="bg-primary-600/20 p-2 rounded-lg">
                <Smartphone className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-200 mb-1">
                  {t('pwa.installTypingFlow').replace('TypingFlow', 'KeysRace')}
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  {t('pwa.installDescription')}
                </p>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInstall}
                    className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('pwa.install')}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDismiss}
                    className="px-3 py-2 text-gray-400 hover:text-gray-200 text-sm transition-colors"
                  >
                    {t('typing.notNow')}
                  </motion.button>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDismiss}
                className="p-1 text-gray-400 hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}