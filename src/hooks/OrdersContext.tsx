import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CartItem } from "./CartContext";

export type OrderStatus = "preparing" | "on_the_way" | "delivered";

export interface Order {
  id: string;
  restaurant: string;
  items: string;
  total: number;
  status: OrderStatus;
  time: string;
  image: string;
  placedAt: Date;
  /** Seconds remaining until auto-advance to next status */
  secondsLeft?: number;
  /** Total seconds for the current stage (used to compute ring %) */
  stageDuration?: number;
}

type OrdersContextType = {
  orders: Order[];
  placeOrder: (cartItems: (CartItem & { quantity: number })[], grandTotal: number) => void;
};

const OrdersContext = createContext<OrdersContextType | null>(null);

/** Seconds each stage lasts before auto-advancing */
const STAGE_DURATIONS: Record<Exclude<OrderStatus, "delivered">, number> = {
  preparing: 30,  // 30s demo — feels snappy
  on_the_way: 40, // 40s demo
};

const nextStatus = (s: OrderStatus): OrderStatus | null =>
  s === "preparing" ? "on_the_way" : s === "on_the_way" ? "delivered" : null;

const formatTime = (status: OrderStatus, secondsLeft?: number): string => {
  if (status === "delivered") return "Delivered ✓";
  if (secondsLeft == null) return "Tracking…";
  const m = Math.floor(secondsLeft / 60);
  const s_ = secondsLeft % 60;
  const label = status === "preparing" ? "Ready for pickup" : "Arriving";
  return `${label} in ${m > 0 ? `${m}m ` : ""}${s_}s`;
};

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-001",
    restaurant: "Biryani House",
    items: "Chicken Biryani × 1, Raita × 1",
    total: 319,
    status: "on_the_way",
    time: "Rider is on the way",
    image:
      "https://images.unsplash.com/photo-1701579231341-59e2a009ddb8?auto=format&fit=crop&w=200&q=80",
    placedAt: new Date(Date.now() - 1000 * 60 * 18),
    secondsLeft: 25,
    stageDuration: STAGE_DURATIONS.on_the_way,
  },
  {
    id: "ORD-002",
    restaurant: "Burger Bay",
    items: "Classic Smash Burger × 2, Fries × 1",
    total: 687,
    status: "delivered",
    time: "Delivered at 7:45 PM",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80",
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Tick every second ──────────────────────────────────────────────
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setOrders((prev) => {
        let changed = false;
        const updated = prev.map((order) => {
          if (order.status === "delivered") return order;

          const newSecondsLeft = (order.secondsLeft ?? 0) - 1;

          if (newSecondsLeft <= 0) {
            const next = nextStatus(order.status);
            if (!next) return order;
            const nextDuration =
              next !== "delivered"
                ? STAGE_DURATIONS[next as Exclude<OrderStatus, "delivered">]
                : undefined;
            changed = true;
            return {
              ...order,
              status: next,
              secondsLeft: nextDuration,
              stageDuration: nextDuration,
              time:
                next === "delivered"
                  ? `Delivered at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : formatTime(next, nextDuration),
            };
          }

          changed = true;
          return {
            ...order,
            secondsLeft: newSecondsLeft,
            time: formatTime(order.status, newSecondsLeft),
          };
        });
        return changed ? updated : prev;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // ── Place new order ────────────────────────────────────────────────
  const placeOrder = useCallback(
    (cartItems: (CartItem & { quantity: number })[], grandTotal: number) => {
      if (cartItems.length === 0) return;

      const itemsSummary = cartItems
        .map((i) => `${i.name} × ${i.quantity}`)
        .join(", ");

      const restaurant =
        cartItems.length === 1 ? cartItems[0].name : "Mixed Order";

      const stageDur = STAGE_DURATIONS.preparing;
      const newOrder: Order = {
        id: `ORD-${String(Date.now()).slice(-4)}`,
        restaurant,
        items: itemsSummary,
        total: grandTotal,
        status: "preparing",
        time: formatTime("preparing", stageDur),
        image: cartItems[0].image,
        placedAt: new Date(),
        secondsLeft: stageDur,
        stageDuration: stageDur,
      };

      setOrders((prev) => [newOrder, ...prev]);
    },
    []
  );

  return (
    <OrdersContext.Provider value={{ orders, placeOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
};
