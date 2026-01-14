import { Card as CardType } from '../../data/cards';
import { Card } from '../Card/Card';
import styles from './CurrentCard.module.css';

interface CurrentCardProps {
  card: CardType | null;
  selected: boolean;
  onClick: () => void;
  isAnimating?: boolean;
  deckHasCards?: boolean;
  onDrawCard?: () => void;
}

export function CurrentCard({ card, selected, onClick, isAnimating = false, deckHasCards = false, onDrawCard }: CurrentCardProps) {
  return (
    <div className={styles.currentCardSlot}>
      {card ? (
        <div className={`${styles.cardWrapper} ${isAnimating ? styles.slideIn : ''}`}>
          <Card
            card={card}
            faceUp={true}
            selected={selected}
            onClick={onClick}
          />
        </div>
      ) : deckHasCards ? (
        <div className={`${styles.empty} ${styles.clickable}`} onClick={onDrawCard}>
          <span>draw a card</span>
        </div>
      ) : (
        <div className={styles.empty}>
          <span>No cards</span>
        </div>
      )}
    </div>
  );
}
