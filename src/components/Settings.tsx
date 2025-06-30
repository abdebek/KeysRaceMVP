import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Volume2, VolumeX, Palette, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface SettingsState {
  soundEnabled: boolean;
  theme: 'dark' | 'light' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  showStats: boolean;
}

export function Settings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('typingSettings');
    return saved ? JSON.parse(saved) : {
      soundEnabled: false,
      theme: 'dark',
      fontSize: 'medium',
      showStats: true
    };
  });

  useEffect(() => {
    localStorage.setItem('typingSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const clearData = () => {
    if (confirm(t('settings.clearDataConfirm'))) {
      localStorage.removeItem('typingResults');
      localStorage.removeItem('personalBests');
      alert(t('settings.allDataCleared'));
    }
  };

  const settingsSections = [
    {
      title: t('settings.audio'),
      icon: settings.soundEnabled ? Volume2 : VolumeX,
      items: [
        {
          label: t('settings.soundEffects'),
          description: t('settings.soundDescription'),
          type: 'toggle' as const,
          value: settings.soundEnabled,
          onChange: (value: boolean) => updateSetting('soundEnabled', value)
        }
      ]
    },
    {
      title: t('settings.appearance'),
      icon: Palette,
      items: [
        {
          label: t('settings.theme'),
          description: t('settings.themeDescription'),
          type: 'select' as const,
          value: settings.theme,
          options: [
            { value: 'dark', label: t('settings.dark') },
            { value: 'light', label: t('settings.light') },
            { value: 'auto', label: t('settings.auto') }
          ],
          onChange: (value: string) => updateSetting('theme', value as SettingsState['theme'])
        },
        {
          label: t('settings.fontSize'),
          description: t('settings.fontSizeDescription'),
          type: 'select' as const,
          value: settings.fontSize,
          options: [
            { value: 'small', label: t('settings.small') },
            { value: 'medium', label: t('settings.medium') },
            { value: 'large', label: t('settings.large') }
          ],
          onChange: (value: string) => updateSetting('fontSize', value as SettingsState['fontSize'])
        }
      ]
    },
    {
      title: t('settings.display'),
      icon: Monitor,
      items: [
        {
          label: t('settings.showStats'),
          description: t('settings.showStatsDescription'),
          type: 'toggle' as const,
          value: settings.showStats,
          onChange: (value: boolean) => updateSetting('showStats', value)
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-primary-400" />
          <h2 className="text-2xl font-bold text-gray-200">{t('settings.title')}</h2>
        </div>

        <div className="space-y-8">
          {settingsSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-success-400" />
                  <h3 className="text-lg font-semibold text-gray-200">{section.title}</h3>
                </div>

                <div className="space-y-4 ml-8">
                  {section.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                      className="flex items-center justify-between bg-dark-800/30 rounded-xl p-4 border border-gray-700/30"
                    >
                      <div>
                        <div className="font-medium text-gray-200">{item.label}</div>
                        <div className="text-sm text-gray-400">{item.description}</div>
                      </div>

                      <div>
                        {item.type === 'toggle' && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => item.onChange(!item.value)}
                            className={`
                              relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                              ${item.value ? 'bg-primary-600' : 'bg-gray-600'}
                            `}
                          >
                            <motion.span
                              animate={{ x: item.value ? 20 : 4 }}
                              transition={{ duration: 0.2 }}
                              className="inline-block h-4 w-4 rounded-full bg-white shadow-lg"
                            />
                          </motion.button>
                        )}

                        {item.type === 'select' && (
                          <select
                            value={item.value}
                            onChange={(e) => item.onChange(e.target.value)}
                            className="bg-dark-700 text-gray-200 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {item.options?.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-200 mb-4">{t('settings.dataManagement')}</h3>
        <div className="bg-dark-800/30 rounded-xl p-4 border border-gray-700/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-200">{t('settings.clearData')}</div>
              <div className="text-sm text-gray-400">
                {t('settings.clearDataDescription')}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearData}
              className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors duration-200"
            >
              {t('settings.clearData')}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}