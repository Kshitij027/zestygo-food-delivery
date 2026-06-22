import React from "react";
import { MapPin, Navigation, Star, ShoppingBag, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "hooks/CartContext";
import styles from "./NearbyRestaurantCard.module.css";

interface NearbyRestaurantProps {
  restaurant: {
    id: string;
    db_id: number | null;
    name: string;
    distance: number;
    address: string;
    categories: string;
    photo: string | null;
    rating: number | null;
    totalRatings: number | null;
  };
}

const NearbyRestaurantCard: React.FC<NearbyRestaurantProps> = ({ restaurant }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const formattedDistance =
    restaurant.distance > 1000
      ? `${(restaurant.distance / 1000).toFixed(1)} km`
      : `${restaurant.distance} m`;

  const handleAction = () => {
    if (restaurant.db_id) {
      // If found in DB, navigate to the internal restaurant page
      navigate(`/restaurant/${restaurant.db_id}`);
    } else {
      // If external, add a mock "Special Combo" to cart
      addToCart({
        id: 90000 + Math.abs(restaurant.id.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0) % 10000),
        name: `Special Combo from ${restaurant.name}`,
        image: restaurant.photo || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",

        price: 499,
        rating: 4.2,
        deliveryTime: "30-40 mins"
      });
    }
  };

  const fallbackImages = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80"
  ];

  const getDeterministicImage = (id: string) => {
    const hash = id.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
    return fallbackImages[Math.abs(hash) % fallbackImages.length];
  };

  const displayImage = restaurant.photo || getDeterministicImage(restaurant.id);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={displayImage} alt={restaurant.name} className={styles.image} />
        <div className={styles.distanceBadge}>
          <Navigation size={12} />
          <span>{formattedDistance} away</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{restaurant.name}</h3>
          {restaurant.rating && (
            <div className={styles.rating}>
              <Star size={12} fill="currentColor" />
              <span>{restaurant.rating}</span>
              {restaurant.totalRatings && (
                <span className={styles.ratingCount}>({restaurant.totalRatings})</span>
              )}
            </div>
          )}
        </div>
        <p className={styles.categories}>{restaurant.categories}</p>
        <div className={styles.footer}>
          <div className={styles.address}>
            <MapPin size={14} />
            <span>{restaurant.address}</span>
          </div>
          <button className={styles.actionBtn} onClick={handleAction}>
            {restaurant.db_id ? (
              <>
                <ExternalLink size={14} />
                <span>View Menu</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NearbyRestaurantCard;
