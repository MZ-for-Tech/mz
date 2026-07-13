import styles from "./StatusDot.module.css";

export function StatusDot({ status }: { status: "LIVE" | "IN DEVELOPMENT" | "COMING SOON" }) {
  const isActive = status === "LIVE" || status === "IN DEVELOPMENT";
  return (
    <div className={`${styles.statusDot} ${isActive ? styles.active : ""}`}>
      <span className={styles.dot}>●</span> {status}
    </div>
  );
}
