import React, { useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, Clock, Tag, Flame, Leaf, ShoppingBag,
  ChevronRight, Search, Plus, Minus, CheckCircle
} from "lucide-react";
import { getRestaurantById, getMenuByRestaurant, getMenuSections, MenuItem } from "lib/restaurants";
import { useCart } from "hooks/CartContext";
import styles from "./RestaurantDetailPage.module.css";

/* ── Veg / Non-veg dot indicator ──────────────────────────────────── */
const VegDot = ({ isVeg }: { isVeg: boolean }) => (
  <span className={`${styles.vegDot} ${isVeg ? styles.vegDotVeg : styles.vegDotNonVeg}`} title={isVeg ? "Veg" : "Non-veg"} />
);

/* ── Single menu item card ─────────────────────────────────────────── */
const MenuItemCard = React.memo(({
  item,
  qty,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  qty: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (id: number) => void;
}) => {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(item);
    if (qty === 0) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }
  };

  return (
    <div className={styles.menuCard}>
      <div className={styles.menuInfo}>
        <div className={styles.menuTopRow}>
          <VegDot isVeg={item.isVeg} />
          {item.isBestseller && (
            <span className={styles.bestsellerBadge}>
              <Star size={10} fill="currentColor" /> Bestseller
            </span>
          )}
          {item.isSpicy && (
            <span className={styles.spicyBadge}>
              <Flame size={10} /> Spicy
            </span>
          )}
        </div>
        <h3 className={styles.menuName}>{item.name}</h3>
        <p className={styles.menuDesc}>{item.description}</p>
        <div className={styles.menuMeta}>
          <span className={styles.menuPrice}>₹{item.price}</span>
          <span className={styles.menuRating}>
            <Star size={11} fill="#16a34a" color="#16a34a" /> {item.rating}
          </span>
        </div>
      </div>

      <div className={styles.menuImgWrap}>
        <img src={item.image} alt={item.name} className={styles.menuImg} loading="lazy" />
        {qty === 0 ? (
          <button
            className={`${styles.addCircleBtn} ${added ? styles.addedBtn : ""}`}
            onClick={handleAdd}
            aria-label={`Add ${item.name}`}
          >
            {added ? <CheckCircle size={16} /> : <Plus size={16} />}
          </button>
        ) : (
          <div className={styles.stepper}>
            <button className={styles.stepBtn} onClick={() => onRemove(item.id)} aria-label="Decrease">
              <Minus size={13} />
            </button>
            <span className={styles.stepQty}>{qty}</span>
            <button className={`${styles.stepBtn} ${styles.stepBtnAdd}`} onClick={handleAdd} aria-label="Increase">
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

/* ── Main Page ─────────────────────────────────────────────────────── */
const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const restaurant = getRestaurantById(Number(id));
  const menuItems  = useMemo(() => getMenuByRestaurant(Number(id)), [id]);
  const sections   = useMemo(() => getMenuSections(Number(id)), [id]);

  const { addToCart, removeFromCart, items: cartItems, totalItems } = useCart();
  const [activeSection, setActiveSection] = useState<string>("All");
  const [search, setSearch] = useState("");

  const qtyMap = useMemo(() => {
    const map: Record<number, number> = {};
    cartItems.forEach((i) => { map[i.id] = i.quantity; });
    return map;
  }, [cartItems]);

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSection = activeSection === "All" || item.category === activeSection;
      const q = search.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      return matchSection && matchSearch;
    });
  }, [menuItems, activeSection, search]);

  const handleAdd = useCallback((item: MenuItem) => {
    // Convert MenuItem → CartItem shape
    addToCart({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      rating: item.rating,
      deliveryTime: item.deliveryTime,
    });
  }, [addToCart]);

  const handleRemove = useCallback((id: number) => {
    removeFromCart(id);
  }, [removeFromCart]);

  if (!restaurant) {
    return (
      <div className={styles.notFound}>
        <h2>Restaurant not found</h2>
        <Link to="/restaurants">← Back to Restaurants</Link>
      </div>
    );
  }

  const vegCount   = menuItems.filter((m) => m.isVeg).length;
  const nonVegCount = menuItems.length - vegCount;

  return (
    <div className={styles.page}>
      {/* Hero banner */}
      <div className={styles.hero} style={{ backgroundImage: `url(${restaurant.image})` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{restaurant.name}</h1>
            <p className={styles.heroCuisine}>{restaurant.cuisine}</p>
            <div className={styles.heroBadges}>
              <span className={styles.heroBadge}>
                <Star size={13} fill="#fff" /> {restaurant.rating}
              </span>
              <span className={styles.heroBadge}>
                <Clock size={13} /> {restaurant.deliveryTime}
              </span>
              {restaurant.discount && (
                <span className={`${styles.heroBadge} ${styles.discountBadge}`}>
                  <Tag size={12} /> {restaurant.discount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky navbar (appears when scrolled) */}
      <div className={styles.stickyBar}>
        <div className="container">
          <div className={styles.stickyInner}>
            <div className={styles.stickyLeft}>
              <span className={styles.stickyName}>{restaurant.name}</span>
              <span className={styles.stickyMeta}>
                <Leaf size={12} className={styles.vegIcon} /> {vegCount} veg &nbsp;·&nbsp; {nonVegCount} non-veg
              </span>
            </div>
            {totalItems > 0 && (
              <Link to="/cart" className={styles.viewCartBtn}>
                <ShoppingBag size={15} /> View Cart ({totalItems})
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Search */}
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder={`Search in ${restaurant.name}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Section tabs */}
        <div className={styles.sections}>
          <button
            className={`${styles.sectionTab} ${activeSection === "All" ? styles.sectionTabActive : ""}`}
            onClick={() => setActiveSection("All")}
          >
            All
          </button>
          {sections.map((s) => (
            <button
              key={s}
              className={`${styles.sectionTab} ${activeSection === s ? styles.sectionTabActive : ""}`}
              onClick={() => setActiveSection(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Menu list — grouped by section when "All" is active */}
        <div className={styles.menuList}>
          {(activeSection === "All" ? sections : [activeSection]).map((section) => {
            const sectionItems = filtered.filter((f) => f.category === section);
            if (sectionItems.length === 0) return null;
            return (
              <div key={section} className={styles.sectionGroup}>
                <h2 className={styles.sectionHeading}>{section}</h2>
                <div className={styles.menuItems}>
                  {sectionItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      qty={qtyMap[item.id] ?? 0}
                      onAdd={handleAdd}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className={styles.empty}>
              <span>🍽️</span>
              <p>No items found. Try a different search.</p>
            </div>
          )}
        </div>

        {/* Floating cart CTA */}
        {totalItems > 0 && (
          <div className={styles.floatingCart}>
            <Link to="/cart" className={styles.floatingCartBtn}>
              <ShoppingBag size={16} /> {totalItems} item{totalItems > 1 ? "s" : ""} in cart — View Cart
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
