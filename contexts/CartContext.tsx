"use client";

import { CartItem } from "@/types/MenuTypes";
import { authClient } from "@/lib/auth-client";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  totalProducts: number;
  totalItems: number;
  vatableSales: number;
  vatAmount: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  syncCart: () => Promise<void>; // call this before checkout
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "cart";

const saveToLocal = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

const loadFromLocal = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const fetchCartFromServer = async (): Promise<CartItem[]> => {
  try {
    const res = await fetch("/api/customer/cart");
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
};

const saveCartToServer = async (items: CartItem[]): Promise<void> => {
  try {
    await fetch("/api/customer/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
      // keepalive allows this to complete even if the tab is closing
      keepalive: true,
    });
  } catch (error) {
    console.error("Failed to sync cart to server", error);
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;
  // Track dirty state — only sync if cart actually changed
  const isDirty = useRef(false);

  // ── Hydrate on mount ────────────────────────────────────────────────

  useEffect(() => {
    const hydrate = async () => {
      const local = loadFromLocal();

      if (isLoggedIn) {
        const server = await fetchCartFromServer();

        // Only merge if local has items AND server is empty
        // (true first-login-with-guest-cart scenario)
        // If server already has items, it means we've synced before — trust server
        if (server.length > 0) {
          // Server is source of truth on refresh
          setCartItems(server);
          saveToLocal(server);
        } else if (local.length > 0) {
          // Server empty, local has items = guest → just logged in
          setCartItems(local);
          saveToLocal(local);
          await saveCartToServer(local);
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems(local);
      }

      setIsHydrated(true);
    };

    hydrate();
  }, [isLoggedIn]);

  // ── Keep localStorage in sync on every change ───────────────────────
  useEffect(() => {
    if (!isHydrated) return;
    saveToLocal(cartItems);
    isDirty.current = true;
  }, [cartItems, isHydrated]);

  // ── Sync to server on tab close (best-effort) ───────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isDirty.current) {
        saveCartToServer(cartItems);
        isDirty.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isLoggedIn, cartItems]);

  // ── Actions ─────────────────────────────────────────────────────────
  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { ...item }];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (isLoggedIn) saveCartToServer([]);
  };

  // Call this explicitly before checkout to guarantee server is up to date
  const syncCart = async () => {
    if (isLoggedIn && isDirty.current) {
      await saveCartToServer(cartItems);
      isDirty.current = false;
    }
  };

  // ── Derived values ───────────────────────────────────────────────────
  const totalProducts = cartItems.length;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const vatableSales = totalPrice / 1.12;
  const vatAmount = totalPrice - vatableSales;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalProducts,
        totalItems,
        vatableSales,
        vatAmount,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Merge server cart + local cart — local quantity wins for duplicates
const mergeCarts = (server: CartItem[], local: CartItem[]): CartItem[] => {
  const merged = [...server];
  for (const localItem of local) {
    const existing = merged.find((s) => s._id === localItem._id);
    if (existing) {
      existing.quantity = Math.max(existing.quantity, localItem.quantity);
    } else {
      merged.push(localItem);
    }
  }
  return merged;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
