import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", textAlign: "center", padding: "2rem",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(52, 168, 83, 0.15)", display: "flex",
        alignItems: "center", justifyContent: "center", marginBottom: "1.5rem",
        animation: "pulse 1.5s ease-in-out infinite",
      }}>
        <CheckCircle2 size={44} color="#34a853" />
      </div>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Payment Successful! 🎉
      </h1>
      <p style={{ color: "#888", fontSize: "1rem", marginBottom: "0.25rem" }}>
        Your order has been placed successfully.
      </p>
      <p style={{ color: "#888", fontSize: "1rem", marginBottom: "2rem" }}>
        Thank you for ordering with <strong style={{ color: "#ea4335" }}>ZestyGo</strong>!
      </p>

      <p style={{ color: "#aaa", fontSize: "0.85rem" }}>
        Redirecting to orders in <strong>{countdown}s</strong>...
      </p>

      <button
        onClick={() => navigate("/orders")}
        style={{
          marginTop: "1rem", padding: "0.75rem 2rem", borderRadius: "12px",
          background: "var(--accent, #ea4335)", color: "#fff", border: "none",
          cursor: "pointer", fontWeight: 600, fontSize: "0.95rem",
          transition: "opacity 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
      >
        View My Orders →
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccessPage;
