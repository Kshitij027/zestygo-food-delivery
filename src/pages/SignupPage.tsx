import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "hooks/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, Key, Store } from "lucide-react";
import styles from "./Auth.module.css";
import { GoogleLogin } from "@react-oauth/google";

const SignupPage = () => {
  const { signup, loginWithGoogle } = useAuthContext();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [role, setRole]         = useState<"user" | "admin">("user");
  const [adminCode, setAdminCode] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await signup(name, email, password, role, role === "admin" ? adminCode : undefined);
      navigate(role === "admin" ? "/admin" : "/profile");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      setError("Failed to sign in with Google");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brandRow}>
          <span className={styles.brandEmoji}>🍔</span>
          <span className={styles.brandName}>ZestyGo</span>
        </div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Join thousands enjoying great food</p>

        <div className={styles.oauthGroup} style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            useOneTap
            theme="filled_blue"
            shape="pill"
            width="100%"
          />
        </div>

        <div className={styles.divider}><span>or sign up with email</span></div>

        {/* Role Toggle */}
        <div style={{
          display: "flex", gap: "0.5rem", marginBottom: "1rem",
          background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px"
        }}>
          <button
            type="button"
            onClick={() => { setRole("user"); setAdminCode(""); setError(""); }}
            style={{
              flex: 1, padding: "0.6rem", borderRadius: "10px", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s",
              background: role === "user" ? "var(--accent, #ea4335)" : "transparent",
              color: role === "user" ? "#fff" : "var(--text-muted, #888)",
            }}
          >
            🍽️ Customer
          </button>
          <button
            type="button"
            onClick={() => { setRole("admin"); setError(""); }}
            style={{
              flex: 1, padding: "0.6rem", borderRadius: "10px", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s",
              background: role === "admin" ? "var(--accent, #ea4335)" : "transparent",
              color: role === "admin" ? "#fff" : "var(--text-muted, #888)",
            }}
          >
            <Store size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
            Restaurant Owner
          </button>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.fieldWrap}>
            <User size={16} className={styles.fieldIcon} />
            <input className={styles.input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.fieldWrap}>
            <Mail size={16} className={styles.fieldIcon} />
            <input className={styles.input} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.fieldWrap}>
            <Lock size={16} className={styles.fieldIcon} />
            <input
              className={styles.input}
              type={showPwd ? "text" : "password"}
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd((v) => !v)} tabIndex={-1}>
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Admin Code Field — only shown for Restaurant Owner */}
          {role === "admin" && (
            <div className={styles.fieldWrap} style={{ borderColor: "var(--accent, #ea4335)" }}>
              <Key size={16} className={styles.fieldIcon} style={{ color: "var(--accent, #ea4335)" }} />
              <input
                className={styles.input}
                type="text"
                placeholder="Enter Admin Code (e.g. ZESTY-R1-ADMIN)"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                required
                style={{ letterSpacing: "1px" }}
              />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Creating account…" : role === "admin" ? "Register as Owner" : "Create account"}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
