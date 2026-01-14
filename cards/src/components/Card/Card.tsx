import { Card as CardType } from '../../data/cards';
import styles from './Card.module.css';

interface CardProps {
  card?: CardType;
  faceUp?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({
  card,
  faceUp = false,
  selected = false,
  onClick,
  className = '',
  style,
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${faceUp ? styles.faceUp : styles.faceDown} ${selected ? styles.selected : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {faceUp && card ? (
        <div className={styles.cardFront}>
          <div className={styles.cardCategory}>{card.category}</div>
          <div className={styles.cardName}>{card.name}</div>
        </div>
      ) : (
        <div className={styles.cardBack}>
          <div className={styles.cardPattern}></div>
        </div>
      )}
    </div>
  );
}
