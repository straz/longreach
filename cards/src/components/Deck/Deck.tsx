import { Card } from '../Card/Card';
import styles from './Deck.module.css';

interface DeckProps {
  count: number;
  filteredCount?: number;
  categoryColor?: string;
  onClick?: () => void;
}

export function Deck({ count, filteredCount, categoryColor, onClick }: DeckProps) {
  const isFiltered = filteredCount !== undefined && categoryColor !== undefined;

  return (
    <div className={styles.deck} onClick={onClick}>
      {count > 0 ? (
        <>
          {/* Stacked cards effect */}
          {count > 2 && <div className={`${styles.stackedCard} ${styles.stack3}`}></div>}
          {count > 1 && <div className={`${styles.stackedCard} ${styles.stack2}`}></div>}
          <Card faceUp={false} />
          {isFiltered ? (
            <div className={styles.countGroup}>
              <div
                className={styles.count}
                style={{ backgroundColor: categoryColor }}
              >
                {filteredCount}
              </div>
              <div className={`${styles.count} ${styles.countSecondary}`}>
                {count}
              </div>
            </div>
          ) : (
            <div className={styles.count}>{count}</div>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <span>Empty</span>
        </div>
      )}
    </div>
  );
}
