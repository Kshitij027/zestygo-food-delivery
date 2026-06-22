import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "lib/api";
import { useAuthContext } from "hooks/AuthContext";
import Card from "components/ui/Card";
import { Package, ShoppingBag, TrendingUp, Clock, BarChart3, Plus } from "lucide-react";
import styles from "./DashboardPage.module.css";

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  totalMenuItems: number;
};

const AdminDashboard = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<Stats | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/restaurant"),
    ])
      .then(([statsRes, restRes]) => {
        setStats(statsRes.data);
        setRestaurantName(restRes.data.name || user?.restaurantName || "Your Restaurant");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="container section">Loading Dashboard...</div>;

  return (
    <div className="container section">
      <div style={{ marginBottom: "2rem" }}>
        <h1>🏪 {restaurantName}</h1>
        <p className="text-muted">Admin Dashboard — Manage your restaurant operations</p>
      </div>

      <div className={styles.stats}>
        <Card>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ padding: "0.75rem", background: "rgba(234, 67, 53, 0.1)", borderRadius: "12px", color: "#ea4335" }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p className={styles.label}>Total Revenue</p>
              <p className={styles.value}>₹{stats?.totalRevenue?.toFixed(0) || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ padding: "0.75rem", background: "rgba(66, 133, 244, 0.1)", borderRadius: "12px", color: "#4285f4" }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className={styles.label}>Total Orders</p>
              <p className={styles.value}>{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ padding: "0.75rem", background: "rgba(52, 168, 83, 0.1)", borderRadius: "12px", color: "#34a853" }}>
              <Clock size={24} />
            </div>
            <div>
              <p className={styles.label}>Active Orders</p>
              <p className={styles.value}>{stats?.activeOrders || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ padding: "0.75rem", background: "rgba(251, 188, 5, 0.1)", borderRadius: "12px", color: "#fbbc05" }}>
              <Package size={24} />
            </div>
            <div>
              <p className={styles.label}>Menu Items</p>
              <p className={styles.value}>{stats?.totalMenuItems || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <Link to="/admin/orders" style={{ textDecoration: "none", color: "inherit" }}>
          <Card>
            <div style={{ padding: "1rem", textAlign: "center" }}>
              <ShoppingBag size={48} style={{ marginBottom: "1rem", color: "#4285f4" }} />
              <h3>Manage Orders</h3>
              <p className="text-muted">Update order statuses and view history.</p>
            </div>
          </Card>
        </Link>
        <Link to="/admin/menu" style={{ textDecoration: "none", color: "inherit" }}>
          <Card>
            <div style={{ padding: "1rem", textAlign: "center" }}>
              <Plus size={48} style={{ marginBottom: "1rem", color: "#34a853" }} />
              <h3>Manage Menu</h3>
              <p className="text-muted">Add, edit, or remove menu items.</p>
            </div>
          </Card>
        </Link>
        <Link to="/admin/analytics" style={{ textDecoration: "none", color: "inherit" }}>
          <Card>
            <div style={{ padding: "1rem", textAlign: "center" }}>
              <BarChart3 size={48} style={{ marginBottom: "1rem", color: "#9c27b0" }} />
              <h3>📊 Analytics</h3>
              <p className="text-muted">Revenue charts, top items & customer insights.</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
