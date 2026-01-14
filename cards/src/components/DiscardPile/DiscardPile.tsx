import { Card as CardType } from '../../data/cards';
import { Card } from '../Card/Card';
import styles from './DiscardPile.module.css';

interface DiscardPileProps {
  count: number;
  topCard?: CardType | null;
  isTopCardSelected?: boolean;
  onClick?: () => void;
}

export function DiscardPile({ count, topCard, isTopCardSelected = false, onClick }: DiscardPileProps) {
  return (
    <div className={styles.discardPile} onClick={onClick}>
      {count > 0 ? (
        <>
          {count > 2 && <div className={`${styles.stackedCard} ${styles.stack3}`}></div>}
          {count > 1 && <div className={`${styles.stackedCard} ${styles.stack2}`}></div>}
          <Card
            card={topCard ?? undefined}
            faceUp={isTopCardSelected}
            selected={isTopCardSelected}
          />
          <div className={styles.count}>{count}</div>
        </>
      ) : (
        <div className={styles.empty}>
        </div>
      )}
    </div>
  );
}
