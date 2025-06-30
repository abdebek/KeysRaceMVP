import React from 'react';
import { useTranslation } from 'react-i18next';

export function FooterStats() {
  const { t } = useTranslation();

  return (
    <div className="bg-dark-800/50 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-primary-400">2025</div>
          <div className="text-xs text-gray-400">{t('footer.builtForFuture')}</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-success-400">6</div>
          <div className="text-xs text-gray-400">{t('footer.prizeCategories')}</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-400">5</div>
          <div className="text-xs text-gray-400">{t('aiCoach.title')}</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-400">100%</div>
          <div className="text-xs text-gray-400">{t('footer.openSource')}</div>
        </div>
      </div>
    </div>
  );
}