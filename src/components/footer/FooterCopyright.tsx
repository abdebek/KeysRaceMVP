import React from 'react';
import { useTranslation } from 'react-i18next';

export function FooterCopyright() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-gray-700/30 space-y-4 md:space-y-0">
      <div className="flex items-center space-x-4 text-sm text-gray-400">
        <span>{t('footer.copyright').replace('TypingFlow', 'KeysRace')}</span>
        <span>•</span>
        <span>{t('footer.madeFor')}</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
          <span className="text-xs text-success-400">{t('footer.liveReady')}</span>
        </div>
      </div>
    </div>
  );
}