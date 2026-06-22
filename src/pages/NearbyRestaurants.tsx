import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, Navigation, RefreshCcw, Loader2, AlertCircle, Search } from "lucide-react";
import NearbyRestaurantCard from "components/features/NearbyRestaurantCard";
import styles from "./NearbyRestaurants.module.css";

interface Restaurant {
  id: string;
  db_id: number | null;
  name: string;
  distance: number;
  address: string;
  categories: string;
  photo: string | null;
  rating: number | null;
  totalRatings: number | null;
}

const NearbyRestaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pincode, setPincode] = useState<string>("");
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  const fetchNearby = async (params: { lat?: number; lon?: number; pincode?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      
      let query = "";
      if (params.pincode) {
        query = `pincode=${params.pincode}`;
      } else {
        query = `lat=${params.lat}&lon=${params.lon}`;
      }

      const response = await axios.get(`${apiBase}/nearby-restaurants?${query}`);
      setRestaurants(response.data.restaurants);
      setLoading(false);
    } catch (err: any) {
      console.error("Fetch error:", err);
      const msg = err.response?.data?.error || "We couldn't reach the backend. Make sure the server is running and your API key is valid.";
      setError(msg);
      setLoading(false);
    }
  };

  const handlePincodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length < 4) {
      setError("Please enter a valid pincode.");
      return;
    }
    fetchNearby({ pincode });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLocationPermission('pending');
    setPincode(""); // Clear pincode when using live location

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission('granted');
        fetchNearby({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      (err) => {
        console.error("Geo error:", err);
        setLocationPermission('denied');
        if (err.code === 1) {
          setError("Location permission denied. Use pincode search instead.");
        } else {
          setError("Unable to retrieve your location. Please try again.");
        }
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconBox}>
            <MapPin size={24} className={styles.headerIcon} />
          </div>
          <div>
            <h1 className={styles.title}>Explore Nearby</h1>
            <p className={styles.subtitle}>Discover incredible food in your area or search by pincode.</p>
          </div>
        </div>
      </header>

      <section className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <form onSubmit={handlePincodeSearch} className={styles.pincodeForm}>
            <div className={styles.inputGroup}>
              <Search size={18} className={styles.searchIconInInput} />
              <input
                type="text"
                placeholder="Enter Pincode (e.g. 110001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={styles.pincodeInput}
              />
            </div>
            <button type="submit" className={styles.searchBtn}>Search</button>
          </form>
          
          <div className={styles.divider}>OR</div>

          <button onClick={getLocation} className={styles.locationBtn}>
            <Navigation size={18} />
            <span>Use Live Location</span>
          </button>
        </div>
      </section>

      <main className={styles.main}>
        {loading && (
          <div className={styles.statusBox}>
            <Loader2 className={styles.spinner} size={48} />
            <p>Fetching the best spots around you...</p>
          </div>
        )}

        {error && !loading && (
          <div className={styles.statusBox}>
            <AlertCircle color="#ef4444" size={48} />
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button onClick={getLocation} className={styles.retryBtn}>
              Try Live Location Again
            </button>
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <div className={styles.statusBox}>
             <MapPin size={48} opacity={0.3} />
             <h3>No restaurants found here</h3>
             <p>Try a different pincode or check your live location settings.</p>
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <div className={styles.grid}>
            {restaurants.map((res) => (
              <NearbyRestaurantCard key={res.id} restaurant={res} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NearbyRestaurants;
