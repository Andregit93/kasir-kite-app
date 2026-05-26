import { useState, useCallback, useEffect } from 'react';

/**
 * useMobileNav — Toggle hook for mobile sidebar drawer.
 * 
 * Returns: { isOpen, toggle, close, open }
 * 
 * Also handles:
 * - Closing on Escape key press
 * - Preventing body scroll when open
 */
export default function useMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') close(); };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  return { isOpen, toggle, close, open };
}
