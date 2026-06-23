import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── AUTH STORE ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    { name: "auth-storage" },
  ),
);

// ─── CART STORE ───────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items;
        const existing = items.find((i) => i.product._id === product._id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1 }] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product._id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.product._id !== productId) });
        } else {
          set({
            items: get().items.map((i) => (i.product._id === productId ? { ...i, quantity } : i)),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      get total() {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      },

      get count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    { name: "cart-storage" },
  ),
);

// ─── UI STORE ─────────────────────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  cartOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
}));
