import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isMobile?: boolean;
}

export function LanguageSelector({ isOpen, onToggle, onClose, isMobile = false }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('preferredLanguage', languageCode);
    onClose();
  };

  // For mobile view, show a different UI
  if (isMobile) {
    return (
      <div className="w-full">
        <h4 className="text-sm font-medium text-gray-400 mb-3">{t('common.selectLanguage')}</h4>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((language) => {
            const isSelected = i18n.language === language.code;
            
            return (
              <motion.button
                key={language.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 text-left
                  ${isSelected 
                    ? 'bg-primary-600/90 text-white shadow-lg' 
                    : 'bg-dark-800 text-gray-300 hover:text-white hover:bg-dark-700'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                </div>
                
                {isSelected && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Language Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="flex items-center space-x-2 px-3 py-2 bg-dark-800 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors"
        title={t('common.selectLanguage', 'Change Language')}
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden md:inline text-sm">{currentLanguage.name}</span>
      </motion.button>

      {/* Language Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          
          {/* Dropdown Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 w-48 bg-dark-900/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-2xl z-50"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-700/50 mb-2">
                {t('common.selectLanguage', 'Select Language')}
              </div>
              
              {languages.map((language) => {
                const isSelected = i18n.language === language.code;
                
                return (
                  <motion.button
                    key={language.code}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`
                      w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 text-left
                      ${isSelected 
                        ? 'bg-primary-600/90 text-white shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-dark-800/80'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{language.flag}</span>
                      <div>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-xs opacity-70">{t(`languages.${language.code}`, language.name)}</div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}