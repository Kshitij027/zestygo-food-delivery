import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WarpShaderHero from "components/ui/wrap-shader";
import { restaurants, categories, Category, Restaurant } from "lib/restaurants";
import { useCart } from "hooks/CartContext";
import { Search, Star, Clock, Zap, MapPin, Tag } from "lucide-react";
import styles from "./HomePage.module.css";

const RestaurantCard = React.memo(({ item, onAdd }: { item: Restaurant; onAdd: (item: Restaurant) => void }) => (
  <article className={styles.restaurantCard}>
    <div className={styles.imgWrap}>
      <img src={item.image} alt={item.name} className={styles.img} loading="lazy" />
      {item.discount && (
        <span className={styles.discountBadge}><Tag size={9} /> {item.discount}</span>
      )}
    </div>
    <div className={styles.cardBody}>
      <div className={styles.row}>
        <strong className={styles.cardName}>{item.name}</strong>
        <span className={styles.rating}><Star size={10} fill="#fff" /> {item.rating}</span>
      </div>
      <p className={styles.cuisine}>{item.cuisine}</p>
      <div className={styles.cardMeta}>
        <span><Clock size={11} /> {item.deliveryTime}</span>
        <span>₹{item.price} avg</span>
      </div>
      <button className={styles.addBtn} onClick={() => onAdd(item)}>+ Add</button>
    </div>
  </article>
));

const FEATURES = [
  { icon: "⚡", title: "Lightning Fast", desc: "30-min guaranteed delivery across the city" },
  { icon: "🛡️", title: "Safe & Trusted", desc: "Verified restaurants with hygiene ratings" },
  { icon: "🤖", title: "AI Recommendations", desc: "Smart food suggestions from our AI chatbot" },
];

const STEPS = [
  { num: "01", icon: <MapPin size={22} />, title: "Pick your spot", desc: "Choose from 100+ restaurants near you" },
  { num: "02", icon: <Tag size={22} />, title: "Customize order", desc: "Add items, customize and apply offers" },
  { num: "03", icon: <Zap size={22} />, title: "Track live", desc: "Real-time updates from kitchen to door" },
];

const TESTIMONIALS = [
  { text: "Best delivery experience in my area. Super quick and always warm food.", author: "Priya S.", stars: 5 },
  { text: "Restaurant options are amazing and checkout is incredibly smooth.", author: "Rahul M.", stars: 5 },
  { text: "Love the chatbot recommendations when I can't decide what to eat!", author: "Ananya K.", stars: 4 },
];

const HomePage = () => {
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const matchesCat = activeCategory === "All" || r.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, search]);

  const handleAdd = useCallback((item: Restaurant) => addToCart(item), [addToCart]);

  const popularOnes = useMemo(
    () => restaurants.filter(r => r.isPopular).length >= 3
      ? restaurants.filter(r => r.isPopular).slice(0, 6)
      : restaurants.slice(0, 6),
    []
  );

  const displayList = search || activeCategory !== "All" ? filtered : popularOnes;

  return (
    <div className="container">
      <WarpShaderHero />

      {/* Search hero bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search restaurants or cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch("")} aria-label="Clear">✕</button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className={styles.categoryRow}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.catPill} ${activeCategory === cat ? styles.catActive : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feature cards */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Why ZestyGo? 🚀</h2>
        <p className={styles.muted}>Everything you need for fast, delightful ordering.</p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <strong className={styles.featureTitle}>{f.title}</strong>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular restaurants */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.heading}>
            {search || activeCategory !== "All" ? "Results" : "Popular Restaurants"} 🔥
          </h2>
          <Link to="/restaurants" className={styles.viewAll}>View all →</Link>
        </div>
        {displayList.length > 0 ? (
          <div className={styles.restaurantGrid}>
            {displayList.map((item) => (
              <Link key={item.id} to={`/restaurant/${item.id}`} className={styles.cardLink}>
                <RestaurantCard item={item} onAdd={handleAdd} />
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <span>🔍</span>
            <p>No restaurants found for "<strong>{search}</strong>"</p>
            <button className={styles.clearBtn} onClick={() => { setSearch(""); setActiveCategory("All"); }}>Clear search</button>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className={styles.section}>
        <h2 className={styles.heading}>How it Works</h2>
        <div className={styles.stepsGrid}>
          {STEPS.map((s) => (
            <div key={s.num} className={styles.stepCard}>
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepIconBox}>{s.icon}</div>
              <strong className={styles.stepTitle}>{s.title}</strong>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.section} style={{ paddingBottom: "2rem" }}>
        <h2 className={styles.heading}>What our foodies say ❤️</h2>
        <div className={styles.testimonialGrid}>
          {TESTIMONIALS.map((t, i) => (
            <blockquote key={i} className={styles.testimonial}>
              <div className={styles.testimonialStars}>
                {"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}
              </div>
              <p className={styles.testimonialText}>"{t.text}"</p>
              <footer className={styles.testimonialAuthor}>— {t.author}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
