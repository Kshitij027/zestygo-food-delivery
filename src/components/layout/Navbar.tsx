import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Home,
  TrendingUp,
  LayoutGrid,
  ClipboardList,
  Heart,
  ShoppingBag,
  UserCircle,
  LogOut,
  ChevronRight,
  X,
  Menu,
  MapPin,
} from "lucide-react";
import { useAuthContext } from "hooks/AuthContext";
import { useCart } from "hooks/CartContext";
import styles from "./Navbar.module.css";

const NAV_ITEMS = [
  { to: "/",            label: "Home",       icon: Home },
  { to: "/restaurants", label: "Trending",   icon: TrendingUp },
  { to: "/restaurants", label: "Categories", icon: LayoutGrid },
  { to: "/orders",      label: "Orders",     icon: ClipboardList },
  { to: "/cart",        label: "Favorites",  icon: Heart },
  { to: "/nearby",      label: "Nearby",    icon: MapPin },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuthContext();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const onLogout = () => { logout(); navigate("/"); };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navItem} ${isActive ? styles.navItemActive : ""}`;

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header className={styles.mobileTopBar}>
        <Link to="/" className={styles.mobileBrand}>
          <span className={styles.brandDot} />
          Culinary Noir
        </Link>
        <div className={styles.mobileActions}>
          <Link to="/cart" className={styles.mobileCartBtn}>
            <ShoppingBag size={18} />
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems > 9 ? "9+" : totalItems}</span>}
          </Link>
          <button className={styles.hamburger} onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar (desktop) / Drawer (mobile) ── */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLink} onClick={() => setMobileOpen(false)}>
            <span className={styles.brandIconWrap}>
              <span className={styles.brandDotLarge} />
            </span>
            <div>
              <div className={styles.brandName}>ZestyGo</div>
              <div className={styles.brandTag}>Fast food delivery</div>
            </div>
          </Link>
        </div>

        <div className={styles.divider} />

        {/* Nav Items */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}><Icon size={18} strokeWidth={1.8} /></span>
              <span className={styles.navLabel}>{label}</span>
              <ChevronRight size={14} className={styles.navChevron} />
            </NavLink>
          ))}
          
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}><LayoutGrid size={18} strokeWidth={1.8} style={{ color: '#ea4335' }} /></span>
              <span className={styles.navLabel} style={{ color: '#ea4335', fontWeight: 'bold' }}>Admin Panel</span>
              <ChevronRight size={14} className={styles.navChevron} />
            </NavLink>
          )}
        </nav>

        <div className={styles.spacer} />
        <div className={styles.divider} />

        {/* Cart shortcut */}
        <Link to="/cart" className={styles.cartShortcut} onClick={() => setMobileOpen(false)}>
          <span className={styles.navIcon}><ShoppingBag size={18} strokeWidth={1.8} /></span>
          <span className={styles.navLabel}>Cart</span>
          {totalItems > 0 && <span className={styles.sidebarBadge}>{totalItems}</span>}
        </Link>

        {/* Bottom user area */}
        <div className={styles.userSection}>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className={styles.userChip} onClick={() => setMobileOpen(false)}>
                {user?.avatar
                  ? <img src={user.avatar} alt={user.name} className={styles.chipAvatar} />
                  : <span className={styles.chipInitials}>{initials}</span>
                }
                <div className={styles.chipInfo}>
                  <span className={styles.chipName}>{user?.name?.split(" ")[0]}</span>
                  <span className={styles.chipSub}>View profile</span>
                </div>
                <UserCircle size={14} className={styles.chipArrow} />
              </Link>
              <button className={styles.logoutBtn} onClick={onLogout}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className={styles.loginBtn} onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/signup" className={styles.signupBtn} onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default React.memo(Navbar);
