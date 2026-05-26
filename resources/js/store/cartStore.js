import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cart store dengan localStorage persistence.
 *
 * Digunakan di Cashier POS untuk:
 * - Menyimpan cart saat refresh page
 * - Persist cart saat browser ditutup
 * - Shared state antar komponen
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      /**
       * Add product ke cart.
       * Jika sudah ada, tambahkan quantity.
       */
      addToCart: (product, quantity = 1) => {
        const cart = get().cart;
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
          // Cek stok maksimal
          const maxStock = product.stock === -1 ? Infinity : product.stock;
          if (existingItem.quantity + quantity > maxStock) {
            return {
              success: false,
              message: `Stok ${product.name} tidak mencukupi! Sisa: ${product.stock}`
            };
          }

          set({
            cart: cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          // Validasi stok untuk item baru
          const maxStock = product.stock === -1 ? Infinity : product.stock;
          if (quantity > maxStock) {
            return {
              success: false,
              message: `Stok ${product.name} tidak mencukupi! Sisa: ${product.stock}`
            };
          }

          set({
            cart: [...cart, {
              ...product,
              quantity,
              // Simpan stock snapshot untuk validasi realtime
              availableStock: product.stock
            }]
          });
        }

        return { success: true };
      },

      /**
       * Remove product dari cart.
       * Jika quantity > 1, kurangi quantity.
       */
      removeFromCart: (productId) => {
        const cart = get().cart;
        const existingItem = cart.find(item => item.id === productId);

        if (!existingItem) return;

        if (existingItem.quantity > 1) {
          set({
            cart: cart.map(item =>
              item.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
          });
        } else {
          set({
            cart: cart.filter(item => item.id !== productId)
          });
        }
      },

      /**
       * Update quantity item di cart.
       */
      updateQuantity: (productId, quantity) => {
        const product = get().cart.find(item => item.id === productId);
        if (!product) return;

        // Validasi stok
        const maxStock = product.availableStock === -1 ? Infinity : product.availableStock;
        if (quantity > maxStock) {
          return {
            success: false,
            message: `Stok tidak mencukupi! Maksimal: ${maxStock}`
          };
        }

        set({
          cart: get().cart.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        });

        return { success: true };
      },

      /**
       * Clear semua isi cart.
       */
      clearCart: () => set({ cart: [] }),

      /**
       * Get total harga cart.
       */
      getTotalPrice: () => {
        return get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      /**
       * Get total item count.
       */
      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      /**
       * Get cart items count (unique products).
       */
      getItemsCount: () => {
        return get().cart.length;
      },
    }),
    {
      name: 'cart-storage', // LocalStorage key
      partialize: (state) => ({ cart: state.cart }), // Hanya persist cart
    }
  )
);

export default useCartStore;
