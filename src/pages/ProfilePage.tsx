import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "hooks/AuthContext";
import {
  User, MapPin, Settings, Plus, Trash2, Check,
  Phone, Mail, CreditCard, Smartphone, LogOut,
  ShieldCheck, Bell, Utensils, Heart,
} from "lucide-react";
import type { Address, PaymentMethod, DietaryPref } from "hooks/useAuth";
import styles from "./ProfilePage.module.css";

/* ── Avatar ─────────────────────────────────────────────────────── */
const Avatar = ({ user }: { user: { name: string; avatar?: string } }) => {
  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return user.avatar
    ? <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
    : <div className={styles.avatarInitials}>{initials}</div>;
};

/* ── Tab: Profile info ───────────────────────────────────────────── */
const ProfileTab = () => {
  const { user, profile, updateUser, updateProfile } = useAuthContext();
  const [name, setName]   = useState(user?.name ?? "");
  const [phone, setPhone] = useState(profile.phone);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUser({ name });
    updateProfile({ phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const DIETARY_OPTIONS: { value: DietaryPref; label: string; emoji: string }[] = [
    { value: "none",  label: "No restriction", emoji: "🍽️" },
    { value: "veg",   label: "Vegetarian",      emoji: "🥗" },
    { value: "vegan", label: "Vegan",            emoji: "🌱" },
    { value: "halal", label: "Halal",            emoji: "☪️" },
  ];

  return (
    <div className={styles.tabContent}>
      {/* Personal Info */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <User size={14} className={styles.sectionIcon} /> Personal Info
        </h3>

        <div className={styles.fieldGroup}>
          <div className={styles.fieldRow}>
            <User size={14} className={styles.labelIcon} />
            <label className={styles.label}>Full Name</label>
          </div>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.fieldRow}>
            <Mail size={14} className={styles.labelIcon} />
            <label className={styles.label}>Email</label>
          </div>
          <input className={`${styles.input} ${styles.inputDisabled}`} value={user?.email ?? ""} disabled />
          <p className={styles.hint}>Email cannot be changed</p>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.fieldRow}>
            <Phone size={14} className={styles.labelIcon} />
            <label className={styles.label}>Phone</label>
          </div>
          <input
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
      </div>

      {/* Dietary preferences */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <Utensils size={14} className={styles.sectionIcon} /> Dietary Preference
        </h3>
        <div className={styles.dietGrid}>
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.dietBtn} ${profile.dietary === opt.value ? styles.dietBtnActive : ""}`}
              onClick={() => updateProfile({ dietary: opt.value })}
            >
              <span className={styles.dietEmoji}>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <Bell size={14} className={styles.sectionIcon} /> Notifications
        </h3>
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Email updates</span>
          <button
            className={`${styles.toggle} ${profile.notifications.email ? styles.toggleOn : ""}`}
            onClick={() => updateProfile({ notifications: { ...profile.notifications, email: !profile.notifications.email } })}
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Push notifications</span>
          <button
            className={`${styles.toggle} ${profile.notifications.push ? styles.toggleOn : ""}`}
            onClick={() => updateProfile({ notifications: { ...profile.notifications, push: !profile.notifications.push } })}
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>
      </div>

      <button className={styles.saveBtn} onClick={handleSave}>
        {saved ? <><Check size={15} /> Saved!</> : "Save changes"}
      </button>
    </div>
  );
};

/* ── Tab: Addresses ──────────────────────────────────────────────── */
const AddressesTab = () => {
  const { profile, updateProfile } = useAuthContext();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: "Home", line: "", city: "", pincode: "" });

  const addAddress = () => {
    if (!form.line || !form.city) return;
    const newAddr: Address = {
      id: `a-${Date.now()}`,
      label: form.label,
      line: form.line,
      city: form.city,
      pincode: form.pincode,
      isDefault: profile.addresses.length === 0,
    };
    updateProfile({ addresses: [...profile.addresses, newAddr] });
    setForm({ label: "Home", line: "", city: "", pincode: "" });
    setAdding(false);
  };

  const setDefault = (id: string) => {
    updateProfile({ addresses: profile.addresses.map((a) => ({ ...a, isDefault: a.id === id })) });
  };

  const remove = (id: string) => {
    const remaining = profile.addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    updateProfile({ addresses: remaining });
  };

  const getAddrIconClass = (label: string) => {
    const lower = label.toLowerCase();
    if (lower === "home") return styles.addrIconHome;
    if (lower === "work") return styles.addrIconWork;
    return styles.addrIconOther;
  };

  const getAddrIcon = (label: string) => {
    const lower = label.toLowerCase();
    if (lower === "home") return "🏠";
    if (lower === "work") return "🏢";
    return "📍";
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <MapPin size={14} className={styles.sectionIcon} /> Saved Addresses
        </h3>

        {profile.addresses.length === 0 && !adding && (
          <div className={styles.emptyText}>
            <span className={styles.emptyIcon}>📍</span>
            No addresses saved yet. Add one to speed up checkout!
          </div>
        )}

        {profile.addresses.map((addr) => (
          <div key={addr.id} className={`${styles.addressCard} ${addr.isDefault ? styles.addressDefault : ""}`}>
            <div className={styles.addressLeft}>
              <div className={`${styles.addrIconBox} ${getAddrIconClass(addr.label)}`}>
                {getAddrIcon(addr.label)}
              </div>
              <div className={styles.addrInfo}>
                <div className={styles.addrLabel}>
                  {addr.label}
                  {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                </div>
                <div className={styles.addrLine}>{addr.line}, {addr.city} {addr.pincode}</div>
              </div>
            </div>
            <div className={styles.addressActions}>
              {!addr.isDefault && (
                <button className={styles.addrBtn} onClick={() => setDefault(addr.id)} title="Set as default">
                  <Check size={13} />
                </button>
              )}
              <button className={`${styles.addrBtn} ${styles.addrBtnDelete}`} onClick={() => remove(addr.id)} title="Remove">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {adding ? (
          <div className={styles.addForm}>
            <select className={styles.input} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}>
              {["Home", "Work", "Other"].map((l) => <option key={l}>{l}</option>)}
            </select>
            <input className={styles.input} placeholder="Street address" value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} />
            <div className={styles.inlineRow}>
              <input className={styles.input} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className={styles.input} placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} style={{ maxWidth: 120 }} />
            </div>
            <div className={styles.inlineRow}>
              <button className={styles.saveBtn} onClick={addAddress}>Add Address</button>
              <button className={styles.cancelBtn} onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className={styles.addBtn} onClick={() => setAdding(true)}>
            <Plus size={15} /> Add new address
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Tab: Payment Methods ────────────────────────────────────────── */
const PaymentTab = () => {
  const { profile, updateProfile } = useAuthContext();
  const [addingUpi, setAddingUpi]   = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [upiId,  setUpiId]  = useState("");
  const [cardNo, setCardNo] = useState("");
  const [cardLabel, setCardLabel] = useState("");

  const addUpi = () => {
    if (!upiId) return;
    const pm: PaymentMethod = { id: `pm-${Date.now()}`, type: "upi", label: upiId, detail: upiId, isDefault: profile.paymentMethods.length === 0 };
    updateProfile({ paymentMethods: [...profile.paymentMethods, pm] });
    setUpiId(""); setAddingUpi(false);
  };

  const addCard = () => {
    if (!cardNo) return;
    const masked = `•••• ${cardNo.slice(-4)}`;
    const pm: PaymentMethod = { id: `pm-${Date.now()}`, type: "card", label: masked, detail: `${cardLabel || "Card"} ${masked}`, isDefault: profile.paymentMethods.length === 0 };
    updateProfile({ paymentMethods: [...profile.paymentMethods, pm] });
    setCardNo(""); setCardLabel(""); setAddingCard(false);
  };

  const setDefault = (id: string) => updateProfile({ paymentMethods: profile.paymentMethods.map((p) => ({ ...p, isDefault: p.id === id })) });
  const remove = (id: string) => {
    const remaining = profile.paymentMethods.filter((p) => p.id !== id);
    if (remaining.length > 0 && !remaining.some((p) => p.isDefault)) remaining[0].isDefault = true;
    updateProfile({ paymentMethods: remaining });
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <CreditCard size={14} className={styles.sectionIcon} /> Payment Methods
        </h3>

        {profile.paymentMethods.length === 0 && (
          <div className={styles.emptyText}>
            <span className={styles.emptyIcon}>💳</span>
            No payment methods saved yet. Add one for faster checkout!
          </div>
        )}

        {profile.paymentMethods.map((pm) => (
          <div key={pm.id} className={`${styles.addressCard} ${pm.isDefault ? styles.addressDefault : ""}`}>
            <div className={styles.addressLeft}>
              <div className={`${styles.addrIconBox} ${pm.type === "upi" ? styles.addrIconHome : styles.addrIconWork}`}>
                {pm.type === "upi" ? "📱" : "💳"}
              </div>
              <div className={styles.addrInfo}>
                <div className={styles.addrLabel}>
                  {pm.detail}
                  {pm.isDefault && <span className={styles.defaultBadge}>Default</span>}
                </div>
                <div className={styles.addrLine}>
                  <span className={`${styles.payTypeBadge} ${pm.type === "upi" ? styles.payTypeBadgeUpi : styles.payTypeBadgeCard}`}>
                    {pm.type === "upi" ? "UPI" : "CARD"}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.addressActions}>
              {!pm.isDefault && <button className={styles.addrBtn} onClick={() => setDefault(pm.id)} title="Set as default"><Check size={13} /></button>}
              <button className={`${styles.addrBtn} ${styles.addrBtnDelete}`} onClick={() => remove(pm.id)} title="Remove"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}

        <div className={styles.inlineRow} style={{ marginTop: 12 }}>
          {!addingUpi && !addingCard && (
            <>
              <button className={styles.addBtn} onClick={() => setAddingUpi(true)}><Smartphone size={14} /> Add UPI</button>
              <button className={styles.addBtn} onClick={() => setAddingCard(true)}><CreditCard size={14} /> Add Card</button>
            </>
          )}
        </div>

        {addingUpi && (
          <div className={styles.addForm}>
            <input className={styles.input} placeholder="UPI ID (e.g. name@okaxis)" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            <div className={styles.inlineRow}>
              <button className={styles.saveBtn} onClick={addUpi}>Save UPI</button>
              <button className={styles.cancelBtn} onClick={() => setAddingUpi(false)}>Cancel</button>
            </div>
          </div>
        )}

        {addingCard && (
          <div className={styles.addForm}>
            <input className={styles.input} placeholder="Card label (Visa / Mastercard)" value={cardLabel} onChange={(e) => setCardLabel(e.target.value)} />
            <input className={styles.input} placeholder="Card number" value={cardNo} onChange={(e) => setCardNo(e.target.value.replace(/\D/g, "").slice(0, 16))} />
            <div className={styles.inlineRow}>
              <button className={styles.saveBtn} onClick={addCard}>Save Card</button>
              <button className={styles.cancelBtn} onClick={() => setAddingCard(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main page ───────────────────────────────────────────────────── */
type Tab = "profile" | "addresses" | "payment";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "profile",   label: "Profile",   icon: <User size={15} /> },
  { key: "addresses", label: "Addresses", icon: <MapPin size={15} /> },
  { key: "payment",   label: "Payment",   icon: <CreditCard size={15} /> },
];

const ProfilePage = () => {
  const { user, profile, logout } = useAuthContext();
  const navigate   = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");

  if (!user) {
    navigate("/login");
    return null;
  }

  const onLogout = () => { logout(); navigate("/"); };

  const memberSince = "Mar 2026";
  const addressCount = profile.addresses.length;
  const paymentCount = profile.paymentMethods.length;

  return (
    <div className="container">
      <div className={styles.page}>
        {/* ── Hero Card ── */}
        <div className={styles.heroCard}>
          <div className={styles.heroOrb} />
          <div className={styles.heroOrb2} />

          <div className={styles.heroInner}>
            <div className={styles.avatarWrap}>
              <Avatar user={{ name: user.name, avatar: user.avatar }} />
            </div>

            <div className={styles.heroInfo}>
              <h1 className={styles.heroName}>{user.name}</h1>
              <p className={styles.heroEmail}>{user.email}</p>
              {user.provider && (
                <div className={styles.providerBadge}>
                  <ShieldCheck size={12} />
                  Verified via {user.provider}
                </div>
              )}
            </div>

            <div className={styles.heroActions}>
              <button className={styles.logoutBtn} onClick={onLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{addressCount}</div>
              <div className={styles.statLabel}>Addresses</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{paymentCount}</div>
              <div className={styles.statLabel}>Payments</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{memberSince}</div>
              <div className={styles.statLabel}>Member Since</div>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className={styles.tabBar}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {tab === "profile"   && <ProfileTab />}
        {tab === "addresses" && <AddressesTab />}
        {tab === "payment"   && <PaymentTab />}
      </div>
    </div>
  );
};

export default ProfilePage;
