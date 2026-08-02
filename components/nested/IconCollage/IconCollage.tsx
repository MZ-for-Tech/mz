import Image from "next/image";
import styles from "./IconCollage.module.css";
import EyeIcon from "./EyeIcon";
import ClaudeIcon from "./ClaudeIcon";
import GeminiIcon from "./GeminiIcon";
import TiktokIcon from "./TiktokIcon";
import BowlsIcon from "./BowlsIcon";
import LinesIcon from "./LinesIcon";
import SquareIcon from "./SquareIcon";
import DotsIcon from "./DotsIcon";
import CircleIcon from "./CircleIcon";
interface IconCollageProps {
  className?: string;
}

export default function IconCollage({ className = "" }: IconCollageProps) {
  return (
    <div className={`${styles.collageContainer} ${className}`}>
      <div className={`${styles.icon} ${styles.icon1}`}><Image src="/nested/icons/1.webp" alt="" fill sizes="150px" className={styles.image} /></div>
      <div className={`${styles.icon} ${styles.icon2}`}>
        <ClaudeIcon />
      </div>
      <div className={`${styles.icon} ${styles.icon3}`}><Image src="/nested/icons/3.webp" alt="" fill sizes="150px" className={styles.image} /></div>
      
      <div className={`${styles.icon} ${styles.icon4}`}><Image src="/nested/icons/4.webp" alt="" fill sizes="150px" className={styles.image} /></div>
      <div className={`${styles.icon} ${styles.icon8}`}>
        <GeminiIcon />
      </div>

      <div className={`${styles.icon} ${styles.icon7}`}>
        <BowlsIcon />
      </div>
      <div className={`${styles.icon} ${styles.icon6}`}>
        <LinesIcon />
      </div>
      <div className={`${styles.icon} ${styles.icon5}`}>
        <EyeIcon />
      </div>

      <div className={`${styles.icon} ${styles.icon9}`}><Image src="/nested/icons/9.webp" alt="" fill sizes="150px" className={styles.image} /></div>
      <div className={`${styles.icon} ${styles.icon10}`}>
        <TiktokIcon />
      </div>
      <div className={`${styles.icon} ${styles.icon11}`}>
        <SquareIcon />
      </div>
      <div className={`${styles.icon} ${styles.icon12}`}>
        <CircleIcon />
      </div>
      <div className={`${styles.icon} ${styles.icon13}`}>
        <DotsIcon />
      </div>
      <div className={`${styles.icon} ${styles.icon14}`}><Image src="/nested/icons/14.webp" alt="" fill sizes="150px" className={styles.image} /></div>
    </div>
  );
}
