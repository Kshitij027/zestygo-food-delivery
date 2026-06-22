import React from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./Button";
import styles from "./wrap-shader.module.css";

type WarpShaderHeroProps = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
};

const WarpShaderHero = ({
  title = "ZestyGo",
  subtitle = "Fast delivery from 100+ top restaurants. Hot food at your door in 30 minutes or less.",
  buttonText = "Explore Restaurants",
}: WarpShaderHeroProps) => {
  return (
    <section className={styles.hero}>
      <div className={styles.shaderLayer} aria-hidden />
      <div className={styles.overlay} aria-hidden />
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80"
        alt=""
        className={`${styles.heroFood} ${styles.left}`}
      />
      <img
        src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80"
        alt=""
        className={`${styles.heroFood} ${styles.right}`}
      />
      <div className={styles.content}>
        <h1 className={styles.title}>
          Order. Track.<br /><em>Enjoy.</em>
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <div className={styles.actions}>
          <Link to="/restaurants">
            <Button>
              {buttonText} <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </Button>
          </Link>
          <Link to="/restaurants">
            <Button variant="ghost">
              <PlayCircle size={16} style={{ marginRight: 6 }} />
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default React.memo(WarpShaderHero);
