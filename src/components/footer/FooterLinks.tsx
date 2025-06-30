import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Star, HelpCircle, Award, Shield, FileText, Mail, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FooterLinksProps {
  onViewChange?: (view: string) => void;
}

export function FooterLinks({ onViewChange }: FooterLinksProps) {
  const { t } = useTranslation();

  const scrollToTextInput = () => {
    setTimeout(() => {
      const textDisplay = document.getElementById('text-display-area');
      if (textDisplay) {
        textDisplay.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { 
      label: t('footer.startTypingTest'), 
      action: () => {
        onViewChange?.('test');
        scrollToTextInput();
      }
    },
    { 
      label: t('footer.viewStatistics'), 
      action: () => {
        onViewChange?.('stats');
        scrollToTop();
      }
    },
    { 
      label: t('footer.typingTutorial'), 
      action: () => {
        onViewChange?.('tutorial');
        scrollToTop();
      }
    },
    { 
      label: t('footer.challenges'), 
      action: () => {
        onViewChange?.('leaderboard');
        scrollToTop();
      }
    },
    { 
      label: t('navigation.settings'), 
      action: () => {
        onViewChange?.('settings');
        scrollToTop();
      }
    }
  ];

  const premiumFeatures = [
    { 
      label: t('footer.aiTypingCoach'), 
      action: () => {
        onViewChange?.('ai-coach');
        scrollToTop();
      }
    },
    { 
      label: t('footer.multiplayerRacing'), 
      action: () => {
        onViewChange?.('multiplayer');
        scrollToTop();
      }
    },
    { 
      label: t('navigation.premium'), 
      action: () => {
        onViewChange?.('premium');
        scrollToTop();
      }
    },
    { 
      label: t('footer.advancedAnalytics'), 
      action: () => {
        onViewChange?.('stats');
        scrollToTop();
      }
    }
  ];

  const supportLinks = [
    { 
      label: t('footer.privacyPolicy'), 
      action: () => {
        onViewChange?.('privacy');
        scrollToTop();
      }, 
      icon: Shield 
    },
    { 
      label: t('footer.termsOfService'), 
      action: () => {
        onViewChange?.('terms');
        scrollToTop();
      }, 
      icon: FileText 
    },
    { label: t('footer.helpSupport'), href: 'mailto:support@keysrace.com', icon: HelpCircle },
    { label: t('footer.contactUs'), href: 'mailto:hello@keysrace.com', icon: Mail }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
      {/* Quick Actions */}
      <div>
        <h4 className="font-semibold text-gray-200 mb-4 flex items-center space-x-2">
          <Rocket className="w-4 h-4 text-success-400" />
          <span>{t('footer.quickStart')}</span>
        </h4>
        <ul className="space-y-2">
          {quickLinks.map((link, index) => (
            <li key={index}>
              <motion.button
                whileHover={{ x: 4 }}
                onClick={link.action}
                className="text-gray-400 hover:text-primary-400 transition-colors text-sm flex items-start space-x-2 w-full text-left"
              >
                <span className="w-1 h-1 bg-primary-400 rounded-full mt-2 flex-shrink-0" />
                <span className="leading-tight">{link.label}</span>
              </motion.button>
            </li>
          ))}
        </ul>
      </div>

      {/* Premium Features */}
      <div>
        <h4 className="font-semibold text-gray-200 mb-4 flex items-center space-x-2">
          <Star className="w-4 h-4 text-amber-400" />
          <span>{t('navigation.premium')}</span>
        </h4>
        <ul className="space-y-2">
          {premiumFeatures.map((link, index) => (
            <li key={index}>
              <motion.button
                whileHover={{ x: 4 }}
                onClick={link.action}
                className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-start space-x-2 w-full text-left"
              >
                <span className="w-1 h-1 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                <span className="leading-tight">{link.label}</span>
              </motion.button>
            </li>
          ))}
        </ul>
      </div>

      {/* Support & Legal */}
      <div>
        <h4 className="font-semibold text-gray-200 mb-4 flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span>{t('footer.support')}</span>
        </h4>
        <ul className="space-y-2">
          {supportLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <li key={index}>
                {link.href ? (
                  <motion.a
                    whileHover={{ x: 4 }}
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-start space-x-2"
                  >
                    <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="leading-tight">{link.label}</span>
                    <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  </motion.a>
                ) : (
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={link.action}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-start space-x-2 w-full text-left"
                  >
                    <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="leading-tight">{link.label}</span>
                  </motion.button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="font-semibold text-gray-200 mb-4 flex items-center space-x-2">
          <Award className="w-4 h-4 text-purple-400" />
          <span>{t('footer.prizeCategories')}</span>
        </h4>
        <ul className="space-y-2 text-sm">
          <li className="text-gray-400 flex items-start space-x-2">
            <Star className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
            <span className="leading-tight">{t('footer.creativeAI')}</span>
          </li>
          <li className="text-gray-400 flex items-start space-x-2">
            <Star className="w-3 h-3 text-pink-400 mt-0.5 flex-shrink-0" />
            <span className="leading-tight">{t('footer.beautifulUI')}</span>
          </li>
          <li className="text-gray-400 flex items-start space-x-2">
            <Star className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="leading-tight">{t('footer.problemFit')}</span>
          </li>
          <li className="text-gray-400 flex items-start space-x-2">
            <Star className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="leading-tight">{t('footer.futureUnicorn')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}