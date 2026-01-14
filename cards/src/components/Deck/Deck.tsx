import { Card } from '../Card/Card';
import styles from './Deck.module.css';

interface DeckProps {
  count: number;
  onClick?: () => void;
}

export function Deck({ count, onClick }: DeckProps) {
  return (
    <div className={styles.deck} onClick={onClick}>
      {count > 0 ? (
        <>
          {/* Stacked cards effect */}
          {count > 2 && <div className={`${styles.stackedCard} ${styles.stack3}`}></div>}
          {count > 1 && <div className={`${styles.stackedCard} ${styles.stack2}`}></div>}
          <Card faceUp={false} />
          <div className={styles.count}>{count}</div>
        </>
      ) : (
        <div className={styles.empty}>
          <span>Empty</span>
        </div>
      )}
    </div>
  );
}
