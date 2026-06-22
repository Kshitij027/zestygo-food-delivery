import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MessageCircle, Send, X, ChevronDown, Bot, Sparkles,
  ShoppingCart, Package, UtensilsCrossed, Trash2
} from "lucide-react";
import { useCart } from "hooks/CartContext";
import { useOrders } from "hooks/OrdersContext";
import { restaurants } from "lib/restaurants";
import { api } from "lib/api";
import styles from "./chatbot.module.css";

type Role = "user" | "bot";
type Message = {
  id: string;
  role: Role;
  content: string;
  time: string;
  chips?: string[];
};

/* ─── Smart reply engine ──────────────────────────────────────────── */
function buildReply(
  text: string,
  cartItems: { name: string; quantity: number; price: number }[],
  orders: { id: string; restaurant: string; status: string; total: number }[]
): { content: string; chips?: string[] } {
  const q = text.toLowerCase().trim();

  /* ── Greetings ── */
  if (/^(hi|hello|hey|sup|yo|howdy|good\s*(morning|evening|afternoon))/.test(q)) {
    return {
      content: "Hey there! 👋 I'm your FoodieAI assistant. What can I help you with today?",
      chips: ["Show my cart", "Track my order", "Best restaurants", "Today's deals"],
    };
  }

  /* ── Cart queries ── */
  if (/cart|basket|bag/.test(q)) {
    if (cartItems.length === 0) {
      return {
        content: "Your cart is empty right now. 🛒 Want me to suggest something delicious?",
        chips: ["Suggest pizza", "Show top picks", "Browse biryani"],
      };
    }
    const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const list = cartItems.map((i) => `• ${i.name} ×${i.quantity} — ₹${i.price * i.quantity}`).join("\n");
    return {
      content: `Here's what's in your cart:\n${list}\n\n🧾 Subtotal: ₹${total}`,
      chips: ["Checkout now", "Clear my cart", "Add more items"],
    };
  }

  /* ── Order tracking ── */
  if (/track|order status|where.*order|delivery status/.test(q)) {
    if (orders.length === 0) {
      return {
        content: "You don't have any active orders right now. Ready to place one? 🍽️",
        chips: ["Browse restaurants", "Best deals today"],
      };
    }
    const latest = orders[0];
    const statusEmoji = { preparing: "👨‍🍳", on_the_way: "🛵", delivered: "✅" }[latest.status] ?? "📦";
    const statusLabel = { preparing: "Being Prepared", on_the_way: "On the Way", delivered: "Delivered" }[latest.status] ?? latest.status;
    return {
      content: `Your latest order **${latest.id}** from **${latest.restaurant}** is currently:\n\n${statusEmoji} **${statusLabel}**\n\nTotal: ₹${latest.total}`,
      chips: ["View all orders", "Track on map", "Contact support"],
    };
  }

  /* ── Restaurant suggestions by cuisine/category ── */
  const cuisineMap: Record<string, string[]> = {
    pizza: ["pizza", "spice route"],
    burger: ["burger", "american"],
    biryani: ["biryani", "indian"],
    pasta: ["pasta", "italian"],
    chinese: ["chinese", "noodles", "wok"],
    tacos: ["tacos", "mexican"],
    salad: ["salad", "healthy", "green"],
    drinks: ["drinks", "coffee", "cafe", "brew"],
  };

  for (const [keyword, tags] of Object.entries(cuisineMap)) {
    if (tags.some((t) => q.includes(t)) || q.includes(keyword)) {
      const matches = restaurants.filter(
        (r) =>
          r.category.toLowerCase() === keyword ||
          r.cuisine.toLowerCase().includes(keyword) ||
          r.name.toLowerCase().includes(keyword)
      );
      if (matches.length > 0) {
        const list = matches
          .map((r) => `🍽️ **${r.name}** — ₹${r.price} · ⭐ ${r.rating} · 🕐 ${r.deliveryTime}`)
          .join("\n");
        return {
          content: `Great choice! Here are the best ${keyword} spots for you:\n\n${list}`,
          chips: ["Add to cart", "Show all restaurants", "Filter by rating"],
        };
      }
    }
  }

  /* ── Best / popular / top picks ── */
  if (/best|top|popular|recommend|suggest|favourite|favorite/.test(q)) {
    const popular = restaurants.filter((r) => r.isPopular).slice(0, 3);
    const list = popular
      .map((r) => `🥇 **${r.name}** — ₹${r.price} · ⭐ ${r.rating}${r.discount ? ` · 🏷️ ${r.discount}` : ""}`)
      .join("\n");
    return {
      content: `Here are today's most popular restaurants:\n\n${list}\n\nAll are highly rated and currently delivering fast! 🚀`,
      chips: ["Order from Biryani House", "View Burger Bay", "More options"],
    };
  }

  /* ── Deals / offers / discount ── */
  if (/deal|offer|discount|promo|coupon|cheap|off|save/.test(q)) {
    const deals = restaurants.filter((r) => r.discount);
    const list = deals
      .map((r) => `🏷️ **${r.name}** — ${r.discount} (starting ₹${r.price})`)
      .join("\n");
    return {
      content: `Here are the active deals for you:\n\n${list}\n\nHurry, these are limited-time offers! ⚡`,
      chips: ["Apply coupon", "Show all"],
    };
  }

  /* ── Delivery time ── */
  if (/how long|delivery time|eta|how fast|quick|fastest/.test(q)) {
    const fastest = [...restaurants].sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime)).slice(0, 3);
    const list = fastest.map((r) => `⚡ **${r.name}** — ${r.deliveryTime}`).join("\n");
    return {
      content: `Fastest deliveries right now:\n\n${list}\n\nAverage delivery across all restaurants is ~27 mins. 🕐`,
      chips: ["Order fastest one", "See all"],
    };
  }

  /* ── Price / budget ── */
  if (/cheap|budget|affordable|under \d+|less than|price|cost/.test(q)) {
    const match = q.match(/under (\d+)|less than (\d+)/);
    const limit = match ? parseInt(match[1] || match[2]) : 250;
    const affordable = restaurants.filter((r) => r.price <= limit);
    if (affordable.length > 0) {
      const list = affordable.map((r) => `💰 **${r.name}** — ₹${r.price} · ⭐ ${r.rating}`).join("\n");
      return {
        content: `Options under ₹${limit}:\n\n${list}`,
        chips: ["Add to cart", "Browse all"],
      };
    }
    return {
      content: `I couldn't find options under ₹${limit}, but our most affordable pick is **Sip & Brew** starting at just ₹149! ☕`,
      chips: ["Show cheapest", "Browse all"],
    };
  }

  /* ── Rating ── */
  if (/rating|rated|highly rated|best rated|stars/.test(q)) {
    const topRated = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 3);
    const list = topRated.map((r) => `⭐ **${r.name}** — ${r.rating}/5`).join("\n");
    return {
      content: `Highest-rated restaurants on our platform:\n\n${list}`,
      chips: ["Order top rated", "Filter by cuisine"],
    };
  }

  /* ── Help ── */
  if (/help|what can you|support|assist|guide/.test(q)) {
    return {
      content: "I can help you with:\n\n🍕 **Restaurant recommendations** — by cuisine, rating, or budget\n🛒 **Cart management** — view, modify or checkout\n📦 **Order tracking** — real-time status updates\n🏷️ **Deals & offers** — current discounts\n⚡ **Fast delivery** — find the quickest options\n\nJust ask away!",
      chips: ["Show deals", "Track order", "Best pizza"],
    };
  }

  /* ── Thanks ── */
  if (/thank|thanks|great|awesome|perfect|nice|good job/.test(q)) {
    return {
      content: "You're welcome! 😊 Happy to help. Enjoy your meal! 🍽️",
      chips: ["Browse more", "View my orders"],
    };
  }

  /* ── Fallback ── */
  return {
    content: "Hmm, I'm not sure about that. But I can definitely help you find food, track orders, or check deals! 🤔",
    chips: ["Restaurant suggestions", "Track my order", "Today's deals", "Get help"],
  };
}

/* ─── Typing animation dots ──────────────────────────────────────── */
const TypingIndicator = () => (
  <div className={styles.typingIndicator}>
    <span /><span /><span />
  </div>
);

/* ─── Markdown-lite renderer ─────────────────────────────────────── */
const MsgText = ({ text }: { text: string }) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <p className={styles.msgText}>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part.split("\n").map((line, j) => (
          <React.Fragment key={`${i}-${j}`}>{line}{j < part.split("\n").length - 1 && <br />}</React.Fragment>
        ))
      )}
    </p>
  );
};

/* ─── Main component ─────────────────────────────────────────────── */
const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  content: "Hi! I'm **FoodieAI** 🤖✨ Your smart food assistant. I can recommend restaurants, track orders, show deals, and more. What are you craving today?",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  chips: ["Best restaurants", "Today's deals", "Track my order", "Fast delivery"],
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { items: cartItems } = useCart();
  const { orders } = useOrders();

  /* scroll to bottom on new messages */
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing]);

  /* focus input when opened */
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, minimized]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // Map local history to Gemini format (user/model)
      const history = messages.slice(-6).map(m => ({
        role: m.role === "bot" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const { data } = await api.post("/chat", { 
        message: text,
        history 
      });

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: data.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        // We can still add some default chips if none come from AI
        chips: ["Best restaurants", "Track my order", "Today's deals"],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: `e-${Date.now()}`,
        role: "bot",
        content: "Sorry, I'm having trouble connecting to my brain. Please try again in a bit! 🧠🔌",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setTyping(false);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleChip = (chip: string) => {
    sendMessage(chip);
  };

  const clearChat = () => {
    setMessages([WELCOME]);
  };

  const unread = !open && messages.length > 1;

  return (
    <>
      {/* FAB */}
      <button
        className={`${styles.fab} ${unread ? styles.fabUnread : ""}`}
        onClick={() => { setOpen((v) => !v); setMinimized(false); }}
        aria-label="Open chat"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        {!open && <span className={styles.fabLabel}>FoodieAI</span>}
        {unread && <span className={styles.badge}>{messages.filter(m => m.role === "bot").length - 1}</span>}
      </button>

      {/* Panel */}
      {open && (
        <div className={`${styles.panel} ${minimized ? styles.panelMinimized : ""}`}>
          {/* Header */}
          <div className={styles.head}>
            <div className={styles.headLeft}>
              <div className={styles.avatarWrap}>
                <Bot size={16} />
              </div>
              <div>
                <div className={styles.headName}>FoodieAI</div>
                <div className={styles.headStatus}>
                  <span className={styles.statusDot} />
                  Always online
                </div>
              </div>
            </div>
            <div className={styles.headActions}>
              <button className={styles.headBtn} onClick={clearChat} title="Clear chat">
                <Trash2 size={14} />
              </button>
              <button className={styles.headBtn} onClick={() => setMinimized((v) => !v)} title="Minimize">
                <ChevronDown size={14} style={{ transform: minimized ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              <button className={styles.headBtn} onClick={() => setOpen(false)} title="Close">
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className={styles.messages} ref={listRef}>
                {messages.map((m) => (
                  <div key={m.id} className={`${styles.msgWrap} ${m.role === "user" ? styles.msgWrapUser : ""}`}>
                    {m.role === "bot" && (
                      <div className={styles.botAvatar}><Sparkles size={12} /></div>
                    )}
                    <div className={`${styles.msg} ${m.role === "user" ? styles.user : styles.bot}`}>
                      <MsgText text={m.content} />
                      <span className={styles.time}>{m.time}</span>
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className={styles.msgWrap}>
                    <div className={styles.botAvatar}><Sparkles size={12} /></div>
                    <div className={`${styles.msg} ${styles.bot}`}>
                      <TypingIndicator />
                    </div>
                  </div>
                )}

                {/* Quick reply chips from last bot message */}
                {!typing && messages.length > 0 && messages[messages.length - 1].role === "bot" && messages[messages.length - 1].chips && (
                  <div className={styles.chips}>
                    {messages[messages.length - 1].chips!.map((chip) => (
                      <button key={chip} className={styles.chip} onClick={() => handleChip(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <form className={styles.form} onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  className={styles.input}
                  placeholder="Ask me anything about food…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={!input.trim() || typing}
                  aria-label="Send"
                >
                  <Send size={15} />
                </button>
              </form>

              {/* Context strip */}
              <div className={styles.contextStrip}>
                <span className={styles.contextItem}>
                  <ShoppingCart size={11} /> {cartItems.length} in cart
                </span>
                <span className={styles.contextItem}>
                  <Package size={11} /> {orders.length} orders
                </span>
                <span className={styles.contextItem}>
                  <UtensilsCrossed size={11} /> {restaurants.length} restaurants
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default React.memo(Chatbot);
