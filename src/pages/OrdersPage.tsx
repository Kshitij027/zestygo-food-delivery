import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle, Clock, Bike, ChefHat, Star, ArrowRight,
  Package, RefreshCw,
} from "lucide-react";
import { useOrders } from "hooks/OrdersContext";
import type { Order, OrderStatus } from "hooks/OrdersContext";
import styles from "./OrdersPage.module.css";

const STEPS: { key: OrderStatus; label: string; icon: React.ReactNode; description: string }[] = [
  { key: "preparing",  label: "Preparing",  icon: <ChefHat size={16} />,    description: "Restaurant is cooking your meal" },
  { key: "on_the_way", label: "On the Way", icon: <Bike size={16} />,        description: "Rider is on their way" },
  { key: "delivered",  label: "Delivered",  icon: <CheckCircle size={16} />, description: "Enjoy your food! 🎉" },
];

const STATUS_ORDER: OrderStatus[] = ["preparing", "on_the_way", "delivered"];

const progressPercent = (status: OrderStatus) => {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === 0 ? 12 : idx === 1 ? 55 : 100;
};

const STATUS_META: Record<OrderStatus, { label: string }> = {
  preparing:  { label: "Preparing your order" },
  on_the_way: { label: "Rider is on the way" },
  delivered:  { label: "Order delivered successfully" },
};

// SVG countdown ring
const CountdownRing = ({
  secondsLeft,
  stageDuration,
  status,
}: {
  secondsLeft: number;
  stageDuration: number;
  status: OrderStatus;
}) => {
  const R = 24;
  const C = 2 * Math.PI * R;
  const progress = Math.max(0, secondsLeft / stageDuration);
  const dashOffset = C * (1 - progress);

  const colorMap: Record<string, string> = {
    preparing: "#FF4D00",
    on_the_way: "#f59e0b",
  };
  const color = colorMap[status] ?? "#22c55e";

  return (
    <div className={styles.ringWrap}>
      <svg width={60} height={60} className={styles.ringSvg}>
        {/* Track */}
        <circle
          cx={30} cy={30} r={R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={4}
        />
        {/* Progress */}
        <circle
          cx={30} cy={30} r={R}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 30 30)"
          style={{ transition: "stroke-dashoffset 0.9s linear", filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className={styles.ringCenter}>
        <span className={styles.ringSeconds} style={{ color }}>
          {secondsLeft > 59
            ? `${Math.ceil(secondsLeft / 60)}m`
            : `${secondsLeft}s`}
        </span>
      </div>
    </div>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const statusIdx = STATUS_ORDER.indexOf(order.status);
  const [rated, setRated] = useState(false);
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);
  const isActive = order.status !== "delivered";
  const meta = STATUS_META[order.status];

  return (
    <div className={`${styles.orderCard} ${styles[`status_${order.status}`]}`}>

      {/* Header */}
      <div className={styles.orderHeader}>
        <div className={styles.orderInfo}>
          <div className={styles.orderId}>{order.id}</div>
          <strong className={styles.restaurantName}>{order.restaurant}</strong>
          <p className={styles.orderItems}>{order.items}</p>
        </div>
        {isActive && order.secondsLeft != null && order.stageDuration ? (
          <CountdownRing
            secondsLeft={order.secondsLeft}
            stageDuration={order.stageDuration}
            status={order.status}
          />
        ) : (
          <img
            src={order.image}
            alt={order.restaurant}
            className={styles.orderThumb}
            loading="lazy"
          />
        )}
      </div>

      {/* Status banner */}
      <div className={`${styles.statusBanner} ${styles[`statusBanner_${order.status}`]}`}>
        <span className={`${styles.statusDot} ${styles[`statusDot_${order.status}`]}`} />
        <span className={styles.statusText}>{meta.label}</span>
        <span className={styles.statusEta}>{order.time}</span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressWrap}>
        <div className={styles.progressTrack}>
          <div
            className={`${styles.progressBar} ${order.status !== "preparing" ? styles[`progressBar_${order.status}`] : ""}`}
            style={{ "--progress-target": `${progressPercent(order.status)}%` } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Step icons */}
      <div className={styles.steps}>
        {STEPS.map((step, i) => {
          const done = i <= statusIdx;
          const active = i === statusIdx;
          return (
            <div
              key={step.key}
              className={`${styles.step} ${done ? styles.stepDone : ""} ${active ? styles.stepActive : ""}`}
            >
              <div className={styles.stepIcon}>{step.icon}</div>
              <div className={styles.stepLabel}>{step.label}</div>
              {active && <div className={styles.stepDesc}>{step.description}</div>}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={styles.orderFooter}>
        <div className={styles.etaRow}>
          <Clock size={13} />
          <span>
            {order.status === "delivered"
              ? order.time
              : order.secondsLeft != null
              ? order.time
              : order.time}
          </span>
        </div>
        <strong className={styles.orderTotal}>₹{order.total}</strong>
        {order.status === "delivered" && (
          <button className={styles.reorderBtn}>
            <RefreshCw size={12} style={{ marginRight: 5 }} />
            Reorder
          </button>
        )}
      </div>

      {/* Rating (delivered only) */}
      {order.status === "delivered" && !rated && (
        <div className={styles.rateSection}>
          <p className={styles.rateLabel}>How was your order?</p>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                className={`${styles.star} ${(hover || rating) >= s ? styles.starActive : ""}`}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => { setRating(s); setRated(true); }}
              >
                <Star size={20} fill={(hover || rating) >= s ? "#f59e0b" : "none"} />
              </button>
            ))}
          </div>
        </div>
      )}
      {order.status === "delivered" && rated && (
        <div className={styles.rated}>🎉 Thanks for your feedback!</div>
      )}
    </div>
  );
};

const OrdersPage = () => {
  const { orders } = useOrders();

  if (orders.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIconWrap}>📦</div>
          <h2 className={styles.emptyTitle}>No orders yet</h2>
          <p className={styles.emptyText}>
            Your order history will appear here once you place your first order.
          </p>
          <Link to="/restaurants" className={styles.browseBtn}>
            Order Now <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== "delivered");
  const pastOrders   = orders.filter(o => o.status === "delivered");

  return (
    <div className="container">
      <div className={styles.pageHeader}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>
              Orders &amp; <span className={styles.titleAccent}>Delivery</span>
            </h1>
            <p className={styles.subtitle}>Live status updates — auto-refreshing every second.</p>
          </div>
          <div className={styles.orderCountBadge}>
            <Package size={13} />
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {activeOrders.length > 0 && (
        <section className={styles.liveSection}>
          <div className={styles.liveSectionHeader}>
            <span className={styles.liveDot} />
            <span className={styles.liveSectionTitle}>Live Orders</span>
          </div>
          <div className={styles.ordersList}>
            {activeOrders.map((order, idx) => (
              <div key={order.id} style={{ animationDelay: `${idx * 0.08}s` }}>
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        </section>
      )}

      {pastOrders.length > 0 && (
        <section className={styles.pastSection}>
          <div className={styles.pastSectionHeader}>Past Orders</div>
          <div className={styles.ordersList}>
            {pastOrders.map((order, idx) => (
              <div key={order.id} style={{ animationDelay: `${idx * 0.08}s` }}>
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OrdersPage;
