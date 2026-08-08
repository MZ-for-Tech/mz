import styles from "./TiktokIcon.module.css";

interface TiktokIconProps {
  className?: string;
}

export default function TiktokIcon({ className = "" }: TiktokIconProps) {
  return (
    <svg
      overflow="visible"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 1080"
      className={`${styles.tiktokSvg} ${className}`}
    >
      <use href="#mz-icon-tiktok" />
    </svg>
  );
}
