import React, { useEffect, useState } from "react";
import { api } from "lib/api";
import Card from "components/ui/Card";
import styles from "./OrdersPage.module.css";

type Order = {
  id: number;
  user_name: string;
  restaurant_name: string;
  total_price: number;
  status: string;
  created_at: string;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/admin/orders");
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="container section">Loading Orders...</div>;

  return (
    <div className="container section">
      <h1>Manage Orders</h1>
      <div style={{ marginTop: "2rem" }}>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {orders.map((order) => (
              <Card key={order.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem" }}>
                  <div>
                    <p style={{ fontWeight: "bold" }}>Order #{order.id}</p>
                    <p className="text-muted">{order.user_name} • ₹{Number(order.total_price).toFixed(2)}</p>
                    <p style={{ fontSize: "0.85rem" }}>{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span style={{ 
                      padding: "0.25rem 0.75rem", 
                      borderRadius: "20px", 
                      fontSize: "0.85rem",
                      backgroundColor: order.status === 'delivered' ? '#e6f4ea' : '#feefe3',
                      color: order.status === 'delivered' ? '#1e8e3e' : '#d93025'
                    }}>
                      {order.status}
                    </span>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{ padding: "0.4rem", borderRadius: "8px", border: "1px solid #ddd" }}
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
