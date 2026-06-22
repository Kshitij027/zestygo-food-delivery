import React from "react";
import styles from "./Toast.module.css";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
}

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const Toast: React.FC<ToastProps> = ({ message, type = "success", visible }) => {
  return (
    <div className={`${styles.toast} ${styles[type]} ${visible ? styles.visible : ""}`}>
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message}</span>
    </div>
  );
};

export default React.memo(Toast);
