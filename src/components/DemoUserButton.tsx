import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface DemoUserButtonProps {
  className?: string;
}

export function DemoUserButton({ className = '' }: DemoUserButtonProps) {
  const { t } = useTranslation();
  const { user, createDemoUser, clearDemoUser } = useAuth();
  
  // Check if current user is a demo user
  const isDemoUser = user?.id?.startsWith('demo-');

  const handleDemoLogin = async () => {
    // Create a demo user in memory first
    const demoUser = createDemoUser();
    
    // Register the demo user in the database
    try {
      // Check if Supabase is configured and the user ID is NOT a demo user
      if (supabase.auth.getSession && !demoUser.id.startsWith('demo-')) {
        // Create a user record in the database
        await supabase.from('users').upsert({
          id: demoUser.id,
          email: demoUser.email,
          username: demoUser.user_metadata.username,
          country: demoUser.user_metadata.country
        }, { onConflict: 'id' });
        
        console.log('Demo user registered in database');
      }
    } catch (error) {
      console.error('Failed to register demo user in database:', error);
      // Continue anyway - the demo user will still work in memory
    }
  };

  const handleDemoLogout = () => {
    clearDemoUser();
  };

  if (user && !isDemoUser) {
    // Don't show for regular logged in users
    return null;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={isDemoUser ? handleDemoLogout : handleDemoLogin}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isDemoUser
          ? 'bg-error-600 text-white hover:bg-error-700'
          : 'bg-success-600 text-white hover:bg-success-700'
      } ${className}`}
    >
      {isDemoUser ? (
        <>
          <LogOut className="w-4 h-4" />
          <span>{t('demoUser.exitDemo')}</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>{t('demoUser.tryDemo')}</span>
        </>
      )}
    </motion.button>
  );
}