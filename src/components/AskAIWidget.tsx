import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AskAIWidgetProps {
  className?: string;
}

export function AskAIWidget({ className = '' }: AskAIWidgetProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  // Function to toggle the Dappier widget
  const toggleDappierWidget = () => {
    // Find the Dappier widget button and click it
    const dappierButton = document.querySelector('.dappier-widget-button') as HTMLElement;
    if (dappierButton) {
      dappierButton.click();
    }
  };

  // Hide our custom button when Dappier widget is open
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const dappierContainer = document.querySelector('.dappier-widget-container') as HTMLElement;
          if (dappierContainer) {
            const isOpen = dappierContainer.classList.contains('dappier-widget-open');
            setIsVisible(!isOpen);
          }
        }
      });
    });

    // Start observing the document for Dappier widget changes
    const dappierContainer = document.querySelector('.dappier-widget-container');
    if (dappierContainer) {
      observer.observe(dappierContainer, { attributes: true });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Hide the default Dappier button
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .dappier-widget-button {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.button
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleDappierWidget}
      className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-success-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
    >
      <MessageSquare className="w-5 h-5" />
      <span className="font-medium">Ask AI</span>
    </motion.button>
  );
}