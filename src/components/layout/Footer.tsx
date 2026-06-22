import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.brand}>
        <span className={styles.dot} />
        <span className={styles.brandName}>ZestyGo</span>
      </div>
      <p className={styles.copy}>© {new Date().getFullYear()} ZestyGo. Fast, fresh delivery at your door.</p>
      <div className={styles.links}>
        <Link to="/features">Features</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/restaurants">Restaurants</Link>
        <Link to="/orders">Orders</Link>
      </div>
    </div>
  </footer>
);

export default React.memo(Footer);
