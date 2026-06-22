import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "hooks/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import styles from "./Auth.module.css";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const { login, loginWithGoogle, user } = useAuthContext();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(email, password);
      // Redirect based on role — need to read from the response
      const storedUser = JSON.parse(localStorage.getItem('saas_user') || '{}');
      navigate(storedUser.role === 'admin' ? '/admin' : '/profile');
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      const storedUser = JSON.parse(localStorage.getItem('saas_user') || '{}');
      navigate(storedUser.role === 'admin' ? '/admin' : '/');
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
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to continue your food journey</p>

        {/* OAuth Buttons */}
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

        <div className={styles.divider}><span>or sign in with email</span></div>

        {/* Email Form */}
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.fieldWrap}>
            <Mail size={16} className={styles.fieldIcon} />
            <input
              className={styles.input}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.fieldWrap}>
            <Lock size={16} className={styles.fieldIcon} />
            <input
              className={styles.input}
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd((v) => !v)} tabIndex={-1}>
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account? <Link to="/signup" className={styles.switchLink}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
