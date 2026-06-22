import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "lib/api";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  ArrowLeft, TrendingUp, ShoppingBag, IndianRupee,
  BarChart3, PieChart as PieIcon, Users, Activity
} from "lucide-react";
import styles from "./AdminAnalytics.module.css";

type Overview = {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  deliveredOrders: number;
  pendingOrders: number;
};

type DailyData = { date: string; day: string; orders: number; revenue: number };
type TopItem = { name: string; totalSold: number; totalRevenue: number };
type StatusData = { status: string; count: number };
type Customer = { id: number; name: string; email: string; orderCount: number; totalSpent: number; lastOrder: string };

const COLORS = ["#ea4335", "#4285f4", "#34a853", "#fbbc05", "#9c27b0"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#fbbc05",
  preparing: "#4285f4",
  delivered: "#34a853",
  cancelled: "#ea4335",
};

const AdminAnalytics = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusData[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/analytics/overview"),
      api.get("/admin/analytics/daily"),
      api.get("/admin/analytics/top-items"),
      api.get("/admin/analytics/status-breakdown"),
      api.get("/admin/analytics/customers"),
    ])
      .then(([ov, dl, ti, sb, cu]) => {
        setOverview(ov.data);
        setDaily(dl.data);
        setTopItems(ti.data);
        setStatusBreakdown(sb.data);
        setCustomers(cu.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading analytics...</div>;
  }

  return (
    <div className={styles.analyticsPage}>
      <Link to="/admin" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className={styles.header}>
        <h1>📊 Restaurant Analytics</h1>
        <p>Real-time insights for your restaurant performance</p>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon} style={{ background: "rgba(234,67,53,0.12)" }}>
            <ShoppingBag size={20} color="#ea4335" />
          </div>
          <div className={styles.cardLabel}>Total Orders</div>
          <div className={styles.cardValue}>{overview?.totalOrders || 0}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon} style={{ background: "rgba(52,168,83,0.12)" }}>
            <IndianRupee size={20} color="#34a853" />
          </div>
          <div className={styles.cardLabel}>Total Revenue</div>
          <div className={styles.cardValue}>₹{(overview?.totalRevenue || 0).toLocaleString()}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon} style={{ background: "rgba(66,133,244,0.12)" }}>
            <TrendingUp size={20} color="#4285f4" />
          </div>
          <div className={styles.cardLabel}>Avg Order Value</div>
          <div className={styles.cardValue}>₹{(overview?.avgOrderValue || 0).toFixed(0)}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon} style={{ background: "rgba(251,188,5,0.12)" }}>
            <Activity size={20} color="#fbbc05" />
          </div>
          <div className={styles.cardLabel}>Delivered</div>
          <div className={styles.cardValue}>{overview?.deliveredOrders || 0}</div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartGrid}>
        {/* Line Chart — Orders per Day */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <BarChart3 size={18} color="#4285f4" />
            Orders — Last 7 Days
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                labelStyle={{ color: "#fff" }}
              />
              <Line type="monotone" dataKey="orders" stroke="#4285f4" strokeWidth={2.5} dot={{ r: 4, fill: "#4285f4" }} />
              <Line type="monotone" dataKey="revenue" stroke="#34a853" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart — Top Selling Items */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <BarChart3 size={18} color="#ea4335" />
            Top Selling Items
          </div>
          {topItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#888" }}>
              No sales data yet. Orders will appear here.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#888" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                />
                <Bar dataKey="totalSold" radius={[0, 8, 8, 0]}>
                  {topItems.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart — Order Status */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <PieIcon size={18} color="#fbbc05" />
            Order Status Breakdown
          </div>
          {statusBreakdown.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#888" }}>
              No orders yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label={(props: any) => `${props.status}: ${props.count}`}
                >
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Customers Table */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <Users size={18} color="#9c27b0" />
            Top Customers
          </div>
          {customers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#888" }}>
              No customer data yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.customersTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Orders</th>
                    <th>Spent</th>
                    <th>Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong>
                        <br />
                        <span style={{ fontSize: "0.8rem", color: "#888" }}>{c.email}</span>
                      </td>
                      <td>{c.orderCount}</td>
                      <td>₹{c.totalSpent.toLocaleString()}</td>
                      <td style={{ fontSize: "0.85rem", color: "#aaa" }}>
                        {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
