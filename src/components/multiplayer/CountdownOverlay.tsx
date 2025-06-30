import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  countdown: number | null;
}

export function CountdownOverlay({ countdown }: CountdownOverlayProps) {
  if (!countdown) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className="text-8xl font-bold text-primary-400"
        >
          {countdown}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}