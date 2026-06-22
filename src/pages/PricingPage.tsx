import React from "react";
import Button from "components/ui/Button";
import { api } from "lib/api";
import styles from "./PricingPage.module.css";

const plans = [
  { name: "Free", price: "₹0", desc: "1 order at a time, basic support", cta: "Get Started" },
  { name: "Pro", price: "₹499/mo", desc: "Priority delivery, premium support", cta: "Upgrade Plan", popular: true },
  { name: "Premium", price: "₹999/mo", desc: "Exclusive offers and fastest SLA", cta: "Go Premium" },
];

const PricingPage = () => {
  const handleUpgrade = async () => {
    const { data } = await api.post("/payments/create-checkout-session", {
      plan: "pro",
    });
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="container section">
      <h1>Choose your plan</h1>
      <p className="text-muted">Flexible plans for foodies and power users.</p>
      <div className={styles.grid}>
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`${styles.plan} ${plan.popular ? styles.popular : ""}`}
          >
            {plan.popular ? <span className={styles.badge}>Most Popular</span> : null}
            <h3>{plan.name}</h3>
            <p className={styles.price}>{plan.price}</p>
            <p>{plan.desc}</p>
            <Button onClick={handleUpgrade}>{plan.cta}</Button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
