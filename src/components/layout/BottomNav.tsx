import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingBag, ClipboardList, User } from "lucide-react";
import { useCart } from "hooks/CartContext";
import styles from "./BottomNav.module.css";

const BottomNav = () => {
  const { totalItems } = useCart();
  const location = useLocation();

  const links = [
    { to: "/", icon: Home, label: "Home", exact: true },
    { to: "/restaurants", icon: UtensilsCrossed, label: "Restaurants", exact: false },
    { to: "/cart", icon: ShoppingBag, label: "Cart", exact: false, badge: totalItems },
    { to: "/orders", icon: ClipboardList, label: "Orders", exact: false },
    { to: "/dashboard", icon: User, label: "Profile", exact: false },
  ];

  return (
    <nav className={styles.nav}>
      {links.map(({ to, icon: Icon, label, exact, badge }) => {
        const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
        return (
          <NavLink key={to} to={to} className={`${styles.item} ${isActive ? styles.active : ""}`}>
            <div className={styles.iconWrap}>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              {badge != null && badge > 0 && (
                <span className={styles.badge}>{badge > 9 ? "9+" : badge}</span>
              )}
            </div>
            <span className={styles.label}>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default React.memo(BottomNav);
