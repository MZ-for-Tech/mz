import styles from "./SectionLabel.module.css";

export function SectionLabel({ label, number, className = "" }: { label: string, number: string, className?: string }) {
  return (
    <div className={`${styles.sectionLabel} ${className}`}>
      [ {number} {"//"} {label} ]
    </div>
  );
}
