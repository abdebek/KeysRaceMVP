import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface TypingEffect {
  id: string;
  type: 'correct' | 'incorrect' | 'combo';
  x: number;
  y: number;
  value?: string | number;
}

interface TypingEffectsProps {
  effects: TypingEffect[];
}

export function TypingEffects({ effects }: TypingEffectsProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {effects.map((effect) => (
          <motion.div
            key={effect.id}
            initial={{ 
              opacity: 1, 
              scale: 0.8, 
              x: effect.x, 
              y: effect.y 
            }}
            animate={{ 
              opacity: 0, 
              scale: 1.2, 
              y: effect.y - 50 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute"
          >
            {effect.type === 'correct' && (
              <div className="text-success-400 font-bold text-lg">+1</div>
            )}
            {effect.type === 'incorrect' && (
              <div className="text-error-400 font-bold text-lg">✗</div>
            )}
            {effect.type === 'combo' && (
              <div className="text-primary-400 font-bold text-xl">
                {effect.value}x {t('typingEffects.combo')}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}