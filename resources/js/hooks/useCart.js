import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/**
 * Custom Hook for Bulletproof Cart Management.
 * Implements Barcode Stutter Protection and Strict Atomic State Merging.
 */
export const useCart = (userId = 'guest') => {
    const [cart, setCart] = useState([]);
    const [isHydrated, setIsHydrated] = useState(false);
    
    // Throttle guard to prevent rapid-fire scanner stutter (< 100ms)
    // We use a Map to track last interaction time PER product ID
    const lastInteractionRef = useRef(new Map());

    const storageKey = useMemo(() => `pos_cart_${userId}`, [userId]);

    // ── HYDRATION & PERSISTENCE ──
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) setCart(parsed);
            }
        } catch (e) {
            localStorage.removeItem(storageKey);
        } finally {
            setIsHydrated(true);
        }
    }, [storageKey]);

    useEffect(() => {
        if (isHydrated) {
            if (cart.length > 0) {
                localStorage.setItem(storageKey, JSON.stringify(cart));
            } else {
                localStorage.removeItem(storageKey);
            }
        }
    }, [cart, isHydrated, storageKey]);

    // ── CALCULATIONS ──
    const totalItems = useMemo(() => 
        cart.reduce((sum, item) => sum + item.quantity, 0), 
    [cart]);

    const totalPrice = useMemo(() => 
        cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
    [cart]);

    // ── ATOMIC METHODS ──
    const addToCart = useCallback((product, onError) => {
        const now = Date.now();
        const lastAction = lastInteractionRef.current.get(product.id) || 0;

        // 🛡️ BARCODE STUTTER PROTECTION
        // Ignore rapid signals for the same ID within 300ms (typical scanner bounce)
        if (now - lastAction < 300) return;
        lastInteractionRef.current.set(product.id, now);

        setCart(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            const currentQty = existingItem ? existingItem.quantity : 0;

            // Optimistic Stock Check
            if (product.stock !== -1 && currentQty >= product.stock) {
                if (onError) onError(`Stok ${product.name} tidak mencukupi!`);
                return prev;
            }

            // STRICT MERGE LOGIC: No duplicates in array
            if (existingItem) {
                return prev.map(item =>
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }

            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.id === productId);
            if (!existingItem) return prev;

            if (existingItem.quantity > 1) {
                return prev.map(item =>
                    item.id === productId 
                        ? { ...item, quantity: item.quantity - 1 } 
                        : item
                );
            }
            return prev.filter(item => item.id !== productId);
        });
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    return {
        cart,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        clearCart,
        isHydrated
    };
};
