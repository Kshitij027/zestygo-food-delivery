import React, { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "hooks/CartContext";
import { useOrders } from "hooks/OrdersContext";
import { useAuthContext } from "hooks/AuthContext";
import { Trash2, Plus, Minus, ArrowRight, CreditCard, Smartphone } from "lucide-react";
import { api } from "lib/api";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const { items, removeFromCart, addToCart, totalItems, totalPrice, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { profile, updateProfile } = useAuthContext();
  const navigate = useNavigate();

  const deliveryFee = totalPrice > 0 ? (totalPrice > 500 ? 0 : 30) : 0;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + taxes;

  const handleAdd = useCallback((item: any) => addToCart(item), [addToCart]);
  const handleRemove = useCallback((id: number) => removeFromCart(id), [removeFromCart]);

  // Payment method selection
  const savedMethods = profile?.paymentMethods ?? [];
  const defaultMethod = savedMethods.find((m) => m.isDefault) ?? savedMethods[0] ?? null;
  const [selectedMethodId, setSelectedMethodId] = useState<string>(defaultMethod?.id ?? "");
  const [addingUpi, setAddingUpi] = useState(false);
  const [newUpi, setNewUpi] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const handleAddUpi = () => {
    if (!newUpi) return;
    const newMethod = { id: `pm-${Date.now()}`, type: "upi" as const, label: newUpi, detail: newUpi, isDefault: savedMethods.length === 0 };
    updateProfile({ paymentMethods: [...savedMethods, newMethod] });
    setSelectedMethodId(newMethod.id);
    setNewUpi(""); setAddingUpi(false);
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const response = await api.post("/payments/create-checkout-session", {
        items: items.map(i => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price
        }))
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      alert("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2 className={styles.emptyTitle}>Your cart is empty</h2>
          <p className={styles.emptyText}>
            Looks like you haven't added anything yet. Let's fix that!
          </p>
          <Link to="/restaurants" className={styles.browseBtn}>
            Browse Restaurants <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Your Cart</h1>
        <p className={styles.subtitle}>{totalItems} item{totalItems > 1 ? "s" : ""} from your favorites</p>
      </div>

      <div className={styles.layout}>
        {/* Items list */}
        <div className={styles.itemsCol}>
          <div className={styles.list}>
            {items.map((item) => (
              <div className={styles.item} key={item.id}>
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.thumb}
                  loading="lazy"
                />
                <div className={styles.info}>
                  <strong className={styles.itemName}>{item.name}</strong>
                  <div className={styles.itemMeta}>{item.deliveryTime}</div>
                  <div className={styles.itemPrice}>₹{item.price} × {item.quantity} = <strong>₹{item.price * item.quantity}</strong></div>
                </div>
                <div className={styles.stepper}>
                  <button
                    className={styles.stepBtn}
                    onClick={() => handleRemove(item.id)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button
                    className={`${styles.stepBtn} ${styles.stepBtnAdd}`}
                    onClick={() => handleAdd(item)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className={styles.clearBtn} onClick={clearCart}>
            <Trash2 size={14} /> Clear Cart
          </button>
        </div>

        {/* Sticky summary */}
        <aside className={styles.summaryCol}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Delivery fee</span>
                <span className={deliveryFee === 0 ? styles.free : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Taxes & fees (5%)</span>
                <span>₹{taxes}</span>
              </div>
              {deliveryFee === 0 && (
                <div className={styles.freeMsg}>🎉 Free delivery on orders above ₹500!</div>
              )}
            </div>

            {/* Payment method selector */}
            <div className={styles.paymentSection}>
              <h4 className={styles.paymentTitle}>Payment Method</h4>
              {savedMethods.length > 0 ? (
                <div className={styles.paymentMethods}>
                  {savedMethods.map((m) => (
                    <label key={m.id} className={`${styles.payMethod} ${selectedMethodId === m.id ? styles.payMethodActive : ""}`}>
                      <input type="radio" name="payment" value={m.id} checked={selectedMethodId === m.id} onChange={() => setSelectedMethodId(m.id)} className={styles.payRadio} />
                      {m.type === "upi" ? <Smartphone size={14} className={styles.payIcon} /> : <CreditCard size={14} className={styles.payIcon} />}
                      <span>{m.detail}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className={styles.noPayment}>No payment methods saved.</p>
              )}
              {!addingUpi ? (
                <button className={styles.addPayBtn} onClick={() => setAddingUpi(true)}>
                  + Add UPI ID
                </button>
              ) : (
                <div className={styles.addUpiForm}>
                  <input className={styles.upiInput} placeholder="UPI ID (e.g. name@okaxis)" value={newUpi} onChange={(e) => setNewUpi(e.target.value)} />
                  <div className={styles.upiActions}>
                    <button className={styles.upiSave} onClick={handleAddUpi}>Save</button>
                    <button className={styles.upiCancel} onClick={() => { setAddingUpi(false); setNewUpi(""); }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <strong>Total</strong>
              <strong className={styles.totalAmt}>₹{grandTotal}</strong>
            </div>

            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <div className={styles.secureNote}>🔒 Secure checkout · 100% safe payments</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
