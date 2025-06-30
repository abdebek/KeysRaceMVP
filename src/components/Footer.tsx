import React from 'react';
import { motion } from 'framer-motion';
import { FooterHackathonBanner } from './footer/FooterHackathonBanner';
import { FooterFeatures } from './footer/FooterFeatures';
import { FooterLinks } from './footer/FooterLinks';
import { FooterStats } from './footer/FooterStats';
import { FooterCopyright } from './footer/FooterCopyright';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  onViewChange?: (view: string) => void;
}

export function Footer({ onViewChange }: FooterProps) {
  const { t } = useTranslation();

  const scrollToTextInput = () => {
    // Scroll to text display area
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

  const handleQuickStartAction = (action: () => void) => {
    action();
    // For test view, scroll to text input
    if (action.toString().includes('test')) {
      scrollToTextInput();
    } else {
      // For other views, scroll to top
      scrollToTop();
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 mt-12"
    >
      {/* Hackathon Banner */}
      <FooterHackathonBanner />

      {/* Key Features */}
      <FooterFeatures />

      {/* Links Grid */}
      <FooterLinks onViewChange={onViewChange} />

      {/* Project Stats Bar */}
      <FooterStats />

      {/* Bottom Bar */}
      <FooterCopyright />
    </motion.footer>
  );
}