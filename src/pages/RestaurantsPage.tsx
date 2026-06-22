import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "components/ui/Button";
import { useCart } from "hooks/CartContext";
import { restaurants, categories, Category, Restaurant } from "lib/restaurants";
import { Search, Clock, Star, Tag, X, ChevronRight } from "lucide-react";
import styles from "./RestaurantsPage.module.css";

const RestaurantCard = React.memo(({ item, onAdd }: { item: Restaurant; onAdd: (item: Restaurant) => void }) => (
  <Link to={`/restaurant/${item.id}`} className={styles.cardLink}>
    <article className={styles.card}>
      <div className={styles.imgWrap}>
        <img
          src={item.image}
          alt={item.name}
          className={styles.img}
          loading="lazy"
        />
        {item.discount && (
          <span className={styles.discountBadge}>
            <Tag size={10} /> {item.discount}
          </span>
        )}
        {item.isNew && <span className={styles.newBadge}>NEW</span>}
        {item.isPopular && !item.isNew && <span className={styles.popularBadge}>🔥 Popular</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.row}>
          <strong className={styles.name}>{item.name}</strong>
          <span className={styles.ratingBadge}>
            <Star size={11} fill="#fff" /> {item.rating}
          </span>
        </div>
        <p className={styles.cuisine}>{item.cuisine}</p>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Clock size={12} /> {item.deliveryTime}
          </span>
          <span className={styles.metaItem}>₹{item.price} avg</span>
        </div>
        <div className={styles.cardFooter}>
          <button
            className={styles.addBtn}
            onClick={(e) => { e.preventDefault(); onAdd(item); }}
          >
            + Quick Add
          </button>
          <span className={styles.viewMenu}>
            View Menu <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </article>
  </Link>
));

const RestaurantsPage = () => {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const matchesCategory = activeCategory === "All" || r.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const handleAdd = useCallback((item: Restaurant) => addToCart(item), [addToCart]);

  const clearSearch = () => setSearch("");

  return (
    <div className="container">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Restaurants near you</h1>
          <p className={styles.subtitle}>Fresh picks. Fast delivery. Top-rated places.</p>
        </div>
      </div>

      {/* Search bar */}
      <div className={styles.searchWrap}>
        <div className={styles.searchInput}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search restaurants or cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.input}
          />
          {search && (
            <button className={styles.clearBtn} onClick={clearSearch}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className={styles.filters}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterPill} ${activeCategory === cat ? styles.filterActive : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {search || activeCategory !== "All" ? (
        <p className={styles.resultCount}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          {search ? ` for "${search}"` : ""}
        </p>
      ) : null}

      {/* Restaurant grid */}
      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((item) => (
            <RestaurantCard key={item.id} item={item} onAdd={handleAdd} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3>No restaurants found</h3>
          <p>Try a different category or search term.</p>
          <Button onClick={() => { setSearch(""); setActiveCategory("All"); }} variant="ghost">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
