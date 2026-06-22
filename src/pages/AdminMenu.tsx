import React, { useEffect, useState } from "react";
import { api } from "lib/api";
import Card from "components/ui/Card";
import Button from "components/ui/Button";
import { Trash2, Plus, Edit2 } from "lucide-react";
import styles from "./DashboardPage.module.css";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: number;
};

const AdminMenu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: 0, image_url: "" });

  const fetchMenu = async () => {
    try {
      // For simplicity, we fetch from restaurant 1 (main restaurant in dev)
      const { data } = await api.get("/restaurants/1/menu");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/restaurants/1/menu", newItem);
      setShowAdd(false);
      setNewItem({ name: "", description: "", price: 0, image_url: "" });
      fetchMenu();
    } catch (err) {
      alert("Failed to add item");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      // Logic for delete might need back-end support, 
      // but for now we update is_active to 0 if delete route isn't specific
      await api.put(`/admin/menu/${id}`, { is_active: 0 });
      fetchMenu();
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  if (loading) return <div className="container section">Loading Menu...</div>;

  return (
    <div className="container section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Manage Menu</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} style={{ marginRight: "0.5rem" }} />
          Add Item
        </Button>
      </div>

      {showAdd && (
        <Card className={styles.addCard}>
          <div style={{ padding: "1.5rem" }}>
          <form onSubmit={handleAdd} style={{ display: "grid", gap: "1rem" }}>
            <h3>Add New Menu Item</h3>
            <input 
              placeholder="Item Name" 
              value={newItem.name} 
              onChange={e => setNewItem({...newItem, name: e.target.value})} 
              required 
              style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid #ddd" }}
            />
            <textarea 
              placeholder="Description" 
              value={newItem.description} 
              onChange={e => setNewItem({...newItem, description: e.target.value})} 
              style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid #ddd" }}
            />
            <input 
              type="number" 
              placeholder="Price" 
              value={newItem.price} 
              onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} 
              required 
              style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid #ddd" }}
            />
            <input 
              placeholder="Image URL" 
              value={newItem.image_url} 
              onChange={e => setNewItem({...newItem, image_url: e.target.value})} 
              style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid #ddd" }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <Button type="submit">Save Item</Button>
              <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {items.filter(i => i.is_active).map((item) => (
          <Card key={item.id}>
            <div style={{ padding: "1rem" }}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px", marginBottom: "1rem" }} />
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ margin: 0 }}>{item.name}</h4>
                  <p className="text-muted" style={{ fontSize: "0.85rem", margin: "0.25rem 0" }}>{item.description}</p>
                  <p style={{ fontWeight: "bold", color: "#34a853" }}>₹{item.price}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleDelete(item.id)} style={{ background: "none", border: "none", color: "#d93025", cursor: "pointer" }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminMenu;
