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

  const focusTypingInput = useCallback(() => {
    if (inputRef.current && !isModalOpen) {
      inputRef.current.focus();
      console.log('Focusing typing input');
    } else {
      console.log('Cannot focus: modal open or input not available');
    }
  }, [isModalOpen]);

  const handleGlobalKeyPress = useCallback((handler: (e: KeyboardEvent) => void) => {
    keyHandlerRef.current = handler;
    console.log('Registered global key handler');
  }, []);

  const removeGlobalKeyPress = useCallback(() => {
    keyHandlerRef.current = null;
    console.log('Removed global key handler');
  }, []);

  // Global keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle typing if modal is open
      if (isModalOpen) {
        console.log('Modal open, ignoring keyboard event');
        return;
      }

      // Don't handle events if target is an input field (except our hidden input)
      const target = e.target as HTMLElement;
      if (
        target && 
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && 
        target !== inputRef.current
      ) {
        console.log('Event target is input/textarea, ignoring');
        return;
      }

      // Don't handle events if target is contenteditable
      if (target && target.isContentEditable) {
        console.log('Event target is contenteditable, ignoring');
        return;
      }

      // Call the registered handler if available
      if (keyHandlerRef.current) {
        console.log('Handling key event:', e.key);
        keyHandlerRef.current(e);
      } else {
        console.log('No key handler registered');
      }
    };

    // Use capture phase to get events before they reach other handlers
    document.addEventListener('keydown', handleKeyDown, true);
    console.log('Added global keydown listener');
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      console.log('Removed global keydown listener');
    };
  }, [isModalOpen]);

  // Auto-focus when typing becomes active and no modal is open
  useEffect(() => {
    if (isTypingActive && !isModalOpen) {
      console.log('Auto-focusing typing input');
      const timer = setTimeout(() => {
        focusTypingInput();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isTypingActive, isModalOpen, focusTypingInput]);

  // Check for modals on mount and when DOM changes
  useEffect(() => {
    const checkForModals = () => {
      const modalElements = document.querySelectorAll('[data-modal]');
      const hasOpenModal = modalElements.length > 0;
      if (hasOpenModal !== isModalOpen) {
        console.log('Modal state changed:', hasOpenModal);
        setIsModalOpen(hasOpenModal);
      }
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

    return () => observer.disconnect();
  }, [isModalOpen]);

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