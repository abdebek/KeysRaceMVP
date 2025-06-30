import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Check for demo user first
    const checkDemoUser = () => {
      const demoUserStr = localStorage.getItem('demo_user');
      if (demoUserStr) {
        try {
          const demoUser = JSON.parse(demoUserStr);
          setUser(demoUser as User);
          setIsPremium(true); // All demo users are premium
          setLoading(false);
          return true;
        } catch (e) {
          console.error('Error parsing demo user:', e);
          localStorage.removeItem('demo_user');
        }
      }
      return false;
    };

    // If no demo user, try Supabase auth
    const checkSupabaseAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          checkPremiumStatus();
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
        setLoading(false);
      }
    };

    // First check for demo user
    if (!checkDemoUser()) {
      // If no demo user, check Supabase
      checkSupabaseAuth();
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          checkPremiumStatus();
        } else {
          setIsPremium(false);
        }
      }
    );

    // Listen for demo auth changes
    const handleDemoAuthChange = () => {
      checkDemoUser();
    };
    window.addEventListener('demo-auth-change', handleDemoAuthChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('demo-auth-change', handleDemoAuthChange);
    };
  }, []);

  const checkPremiumStatus = async () => {
    try {
      // For demo purposes, let's make all authenticated users "premium"
      // In production, this would check actual subscription status
      setIsPremium(true);
      
      // This is the real implementation that would be used in production:
      /*
      const { data } = await supabase
        .from('users')
        .select('premium_until')
        .eq('id', user?.id)
        .maybeSingle();

      if (data && data.premium_until) {
        setIsPremium(new Date(data.premium_until) > new Date());
      } else {
        setIsPremium(false);
      }
      */
    } catch (error) {
      console.error('Error checking premium status:', error);
      // For demo purposes, default to premium for authenticated users
      setIsPremium(true);
    }
  };

  return {
    user,
    loading,
    isPremium,
    isAuthenticated: !!user && !loading,
    checkPremiumStatus
  };
}