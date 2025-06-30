import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, AlertTriangle, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TermsOfService() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="glass-card p-8 text-center">
        <FileText className="w-16 h-16 text-primary-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-200 mb-4">{t('terms.title')}</h1>
        <p className="text-gray-400">
          {t('terms.lastUpdated')}
        </p>
      </div>

      {/* Content */}
      <div className="glass-card p-8">
        <div className="prose prose-invert max-w-none">
          
          {/* Introduction */}
          <section className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-success-400" />
              <h2 className="text-xl font-bold text-gray-200">{t('terms.agreementToTerms')}</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {t('terms.agreementDescription').replace('TypingFlow', 'KeysRace')}
            </p>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('terms.serviceDescription')}</h2>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">
                {t('terms.serviceDescriptionText').replace('TypingFlow', 'KeysRace')}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t('terms.typingTests')}</li>
                <li>{t('terms.interactiveTutorials')}</li>
                <li>{t('terms.performanceAnalytics')}</li>
                <li>{t('terms.gamifiedChallenges')}</li>
                <li>{t('terms.virtualKeyboard')}</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-6 h-6 text-primary-400" />
              <h2 className="text-xl font-bold text-gray-200">{t('terms.acceptableUse')}</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">{t('terms.acceptableUseDescription').replace('TypingFlow', 'KeysRace')}</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t('terms.unauthorizedAccess')}</li>
                <li>{t('terms.automatedTools')}</li>
                <li>{t('terms.interfereService')}</li>
                <li>{t('terms.violateLaws')}</li>
                <li>{t('terms.reverseEngineer')}</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('terms.intellectualProperty')}</h2>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">
                {t('terms.intellectualPropertyDescription').replace('TypingFlow', 'KeysRace')}
              </p>
              <p className="leading-relaxed">
                {t('terms.textContentDescription')}
              </p>
            </div>
          </section>

          {/* User Data */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('terms.userData')}</h2>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">
                {t('terms.userDataDescription').replace('TypingFlow', 'KeysRace')}
              </p>
              <p className="leading-relaxed">
                {t('terms.userDataResponsibility')}
              </p>
            </div>
          </section>

          {/* Service Availability */}
          <section className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-gray-200">{t('terms.serviceAvailability')}</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">
                {t('terms.serviceAvailabilityDescription').replace('TypingFlow', 'KeysRace')}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t('terms.scheduledMaintenance')}</li>
                <li>{t('terms.technicalIssues')}</li>
                <li>{t('terms.thirdPartyDependencies')}</li>
                <li>{t('terms.forceMajeure')}</li>
              </ul>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('terms.disclaimers')}</h2>
            <div className="text-gray-300 space-y-3">
              <p className="leading-relaxed">
                {t('terms.disclaimersDescription').replace('TypingFlow', 'KeysRace')}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t('terms.errorFree')}</li>
                <li>{t('terms.perfectFeatures')}</li>
                <li>{t('terms.dataPreservation')}</li>
                <li>{t('terms.specificRequirements')}</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('terms.limitationOfLiability')}</h2>
            <p className="text-gray-300 leading-relaxed">
              {t('terms.limitationDescription').replace('TypingFlow', 'KeysRace')}
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('terms.changesToTerms')}</h2>
            <p className="text-gray-300 leading-relaxed">
              {t('terms.changesToTermsDescription').replace('TypingFlow', 'KeysRace')}
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-bold text-gray-200 mb-4">{t('terms.governingLaw')}</h2>
            <p className="text-gray-300 leading-relaxed">
              {t('terms.governingLawDescription').replace('TypingFlow', 'KeysRace')}
            </p>
          </section>

        </div>
      </div>
    </motion.div>
  );
}