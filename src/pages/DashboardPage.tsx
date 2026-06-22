import React, { useEffect, useMemo, useState } from "react";
import Card from "components/ui/Card";
import { useAuthContext } from "hooks/AuthContext";
import { api } from "lib/api";
import styles from "./DashboardPage.module.css";

type Order = {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  restaurant_name?: string;
};

const DashboardPage = () => {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const { data } = await api.get<Order[]>("/orders/my");
        if (mounted) setOrders(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0),
    [orders]
  );

  return (
    <div className="container section">
      <div className={styles.head}>
        <h1>Welcome back, {user?.name || "Foodie"}.</h1>
        <p className="text-muted">{user?.email}</p>
      </div>
      <div className={styles.stats}>
        <Card>
          <p className={styles.label}>Total Orders</p>
          <p className={styles.value}>{loading ? "..." : orders.length}</p>
        </Card>
        <Card>
          <p className={styles.label}>Total Spent</p>
          <p className={styles.value}>₹{loading ? "..." : totalSpent.toFixed(0)}</p>
        </Card>
        <Card>
          <p className={styles.label}>Preferred Role</p>
          <p className={styles.value} style={{ fontSize: "1.25rem" }}>
            {user?.role || "user"}
          </p>
        </Card>
      </div>
      <div className={styles.list}>
        {orders.slice(0, 4).map((order) => (
          <article key={order.id} className={styles.order}>
            <strong>Order #{order.id}</strong> • {order.restaurant_name || "Restaurant"} • ₹
            {Number(order.total_price).toFixed(0)} • {order.status}
          </article>
        ))}
        {!loading && orders.length === 0 ? (
          <p className="text-muted">No orders yet. Place your first food order now.</p>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardPage;
