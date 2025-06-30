import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ViewManager } from './components/ViewManager';
import { Footer } from './components/Footer';
import { SEOHead } from './components/SEOHead';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineMode } from './components/OfflineMode';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { NotificationSystem, useNotifications } from './components/NotificationSystem';
import { TypingProvider } from './contexts/TypingContext';
import { TestConfig } from './types';

function App() {
  const [currentView, setCurrentView] = useState('test'); // Start with test view instead of hackathon
  const [config, setConfig] = useState<TestConfig>({
    mode: 'time',
    timeLimit: 60,
    wordLimit: 50,
    textCategory: 'quotes'
  });

  const { notifications, removeNotification } = useNotifications();

  // Show hackathon showcase only once
  useEffect(() => {
    const hasSeenShowcase = localStorage.getItem('hasSeenHackathonShowcase');
    if (!hasSeenShowcase) {
      setCurrentView('hackathon');
      localStorage.setItem('hasSeenHackathonShowcase', 'true');
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    // Scroll to top for non-test views
    if (view !== 'test') {
      scrollToTop();
    }
  };

  return (
    <TypingProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
          <SEOHead />
          
          {/* Background Pattern */}
          <div className="fixed inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Offline Mode Indicator */}
          <OfflineMode />

          {/* PWA Install Prompt */}
          <PWAInstallPrompt />

          {/* Notification System */}
          <NotificationSystem 
            notifications={notifications} 
            onRemove={removeNotification} 
          />

          {/* Header now spans full width */}
          <Header currentView={currentView} onViewChange={handleViewChange} />

          {/* Content with wider container */}
          <div className="relative z-10 container mx-auto px-4 py-4 md:py-8 max-w-9xl">
            <ViewManager 
              currentView={currentView}
              config={config}
              onConfigChange={setConfig}
              onViewChange={handleViewChange}
            />

            <Footer onViewChange={handleViewChange} />
          </div>
        </div>
      </ErrorBoundary>
    </TypingProvider>
  );
}

export default App;