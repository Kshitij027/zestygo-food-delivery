import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Toast from "components/ui/Toast";

export type CartItem = {
  id: number;
  name: string;
  image: string;
  price: number;
  rating: number;
  deliveryTime: string;
};

type CartEntry = CartItem & { quantity: number };

type CartContextType = {
  items: CartEntry[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Record<number, CartEntry>>({});
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message: msg, visible: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2200);
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          ...item,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
    showToast(`${item.name} added to cart!`);
  }, [showToast]);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { ...existing, quantity: existing.quantity - 1 } };
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const items = useMemo(() => Object.values(cart), [cart]);
  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
      <Toast message={toast.message} visible={toast.visible} type="success" />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
