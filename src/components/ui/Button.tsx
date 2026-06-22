import React from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const Button = ({ variant = "primary", className = "", ...props }: Props) => {
  const variantClass = styles[variant];
  return (
    <button className={`${styles.button} ${variantClass} ${className}`} {...props} />
  );
};

export default React.memo(Button);
