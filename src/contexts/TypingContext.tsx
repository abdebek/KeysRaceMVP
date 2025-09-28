import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

interface TypingContextType {
  isTypingActive: boolean;
  isModalOpen: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  setIsTypingActive: (active: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
  focusTypingInput: () => void;
  handleGlobalKeyPress: (handler: (e: KeyboardEvent) => void) => void;
  removeGlobalKeyPress: () => void;
}

const TypingContext = createContext<TypingContextType | undefined>(undefined);

export function TypingProvider({ children }: { children: React.ReactNode }) {
  const [isTypingActive, setIsTypingActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyHandlerRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const lastFocusAttempt = useRef<number>(0);
  const focusTimeoutRef = useRef<number>();

  const focusTypingInput = useCallback(() => {
    if (inputRef.current && !isModalOpen) {
      // Prevent too many focus attempts in a short period
      const now = Date.now();
      if (now - lastFocusAttempt.current < 100) {
        return; // Skip if we just tried to focus
      }
      
      lastFocusAttempt.current = now;
      
      // Clear any pending focus timeout
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      
      // Try to focus the input
      try {
        inputRef.current.focus({ preventScroll: true });
        
        // On mobile, sometimes we need to click the input first
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          inputRef.current.click();
          inputRef.current.focus({ preventScroll: true });
        }
      } catch (error) {
        console.error('Error focusing input:', error);
      }
    }
  }, [isModalOpen]);

  const handleGlobalKeyPress = useCallback((handler: (e: KeyboardEvent) => void) => {
    keyHandlerRef.current = handler;
  }, []);

  const removeGlobalKeyPress = useCallback(() => {
    keyHandlerRef.current = null;
  }, []);

  // Global keyboard event handler - optimized to reduce overhead
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle typing if modal is open
      if (isModalOpen) {
        return;
      }

      // Don't handle events if target is an input field (except our hidden input)
      const target = e.target as HTMLElement;
      if (
        target && 
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && 
        target !== inputRef.current
      ) {
        return;
      }

      // Don't handle events if target is contenteditable
      if (target && target.isContentEditable) {
        return;
      }

      // Call the registered handler if available
      if (keyHandlerRef.current) {
        keyHandlerRef.current(e);
      }
    };

    // Use capture phase to get events before they reach other handlers
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isModalOpen]);

  // Auto-focus when typing becomes active and no modal is open - with debouncing
  useEffect(() => {
    if (isTypingActive && !isModalOpen) {
      // Clear any existing timeout
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      
      // Set a new timeout with a short delay
      focusTimeoutRef.current = window.setTimeout(() => {
        focusTypingInput();
      }, 100);
      
      return () => {
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
        }
      };
    }
  }, [isTypingActive, isModalOpen, focusTypingInput]);

  // Check for modals on mount and when DOM changes - optimized with debouncing
  useEffect(() => {
    let checkTimeout: number;
    
    const checkForModals = () => {
      // Cancel any pending check
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
      
      // Schedule a new check with a short delay to batch multiple DOM changes
      checkTimeout = window.setTimeout(() => {
        const modalElements = document.querySelectorAll('[data-modal]');
        const hasOpenModal = modalElements.length > 0;
        if (hasOpenModal !== isModalOpen) {
          setIsModalOpen(hasOpenModal);
        }
      }, 50);
    };

    // Initial check
    checkForModals();

    // Set up mutation observer to detect modal changes
    const observer = new MutationObserver(checkForModals);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-modal']
    });

    return () => {
      observer.disconnect();
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
    };
  }, [isModalOpen]);

  // Periodically check if input should be focused - with reduced frequency
  useEffect(() => {
    if (!isTypingActive || isModalOpen) return;
    
    const focusCheckInterval = setInterval(() => {
      if (isTypingActive && !isModalOpen && document.activeElement !== inputRef.current) {
        focusTypingInput();
      }
    }, 3000); // Check less frequently (3 seconds)
    
    return () => clearInterval(focusCheckInterval);
  }, [isTypingActive, isModalOpen, focusTypingInput]);

  return (
    <TypingContext.Provider
      value={{
        isTypingActive,
        isModalOpen,
        inputRef,
        setIsTypingActive,
        setIsModalOpen,
        focusTypingInput,
        handleGlobalKeyPress,
        removeGlobalKeyPress,
      }}
    >
      {children}
      {/* Global hidden input for capturing keyboard events */}
      <input
        ref={inputRef}
        className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        tabIndex={-1}
        aria-hidden="true"
        id="global-typing-input"
      />
    </TypingContext.Provider>
  );
}

export function useTyping() {
  const context = useContext(TypingContext);
  if (context === undefined) {
    throw new Error('useTyping must be used within a TypingProvider');
  }
  return context;
}