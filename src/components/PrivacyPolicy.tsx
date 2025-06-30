import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, Lock, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="glass-card p-8 text-center">
        <Shield className="w-16 h-16 text-primary-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-200 mb-4">{t('privacy.title')}</h1>
        <p className="text-gray-400">
          {t('privacy.lastUpdated')}
        </p>
      </div>

      {/* Content */}
      <div className="glass-card p-8">
        <div className="prose prose-invert max-w-none">
          
          {/* Introduction */}
          <section className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-success-400" />
              <h2 className="text-xl font-bold text-gray-200">{t('privacy.introduction')}</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {t('privacy.introductionText').replace('TypingFlow', 'KeysRace')}
            </p>
          </section>

          {/* Data Collection */}
          <section className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-primary-400" />
              <h2 className="text-xl font-bold text-gray-200">{t('privacy.dataCollection')}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">{t('privacy.localStorageData')}</h3>
                <p className="leading-relaxed">
                  {t('privacy.localStorageDescription').replace('TypingFlow', 'KeysRace')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">{t('privacy.analyticsData')}</h3>
                <p className="leading-relaxed">
                  {t('privacy.analyticsDescription')}
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>{t('privacy.pageViews')}</li>
                  <li>{t('privacy.featureUsage')}</li>
                  <li>{t('privacy.errorReports')}</li>
                  <li>{t('privacy.generalLocation')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Usage */}
          <section className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-gray-200">{t('privacy.dataUsage')}</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">{t('privacy.dataUsageDescription')}</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t('privacy.provideService')}</li>
                <li>{t('privacy.saveProgress')}</li>
                <li>{t('privacy.improvePerformance')}</li>
                <li>{t('privacy.analyzeUsage')}</li>
                <li>{t('privacy.ensureSecurity')}</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-success-400" />
              <h2 className="text-xl font-bold text-gray-200">{t('privacy.dataSecurity')}</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">
                {t('privacy.dataSecurityDescription')}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t('privacy.httpsEncryption')}</li>
                <li>{t('privacy.noPersonalData')}</li>
                <li>{t('privacy.regularAudits')}</li>
                <li>{t('privacy.minimalCollection')}</li>
              </ul>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('privacy.thirdPartyServices')}</h2>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">
                {t('privacy.thirdPartyDescription').replace('TypingFlow', 'KeysRace')}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t('privacy.netlify')}</li>
                <li>{t('privacy.googleAnalytics')}</li>
              </ul>
              <p className="leading-relaxed mt-3">
                {t('privacy.thirdPartyPolicies')}
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('privacy.yourRights')}</h2>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">{t('privacy.yourRightsDescription')}</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t('privacy.clearLocalData')}</li>
                <li>{t('privacy.disableTracking')}</li>
                <li>{t('privacy.requestInformation')}</li>
                <li>{t('privacy.useWithoutPersonalInfo')}</li>
              </ul>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-gray-200">{t('privacy.policyUpdates')}</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {t('privacy.policyUpdatesDescription')}
            </p>
          </section>

          {/* No Data Collection Notice */}
          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('privacy.noDataCollectionNotice')}</h2>
            <div className="bg-success-900/20 border border-success-500/30 rounded-lg p-4">
              <p className="text-success-300 leading-relaxed">
                <strong>{t('common.important')}:</strong> {t('privacy.noDataCollectionDescription').replace('TypingFlow', 'KeysRace')}
              </p>
            </div>
          </section>

        </div>
      </div>
    </motion.div>
  );
}