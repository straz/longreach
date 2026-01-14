import { Card as CardType } from '../../data/cards';
import { Card } from '../Card/Card';
import styles from './CurrentCard.module.css';

interface CurrentCardProps {
  card: CardType | null;
  selected: boolean;
  onClick: () => void;
  isAnimating?: boolean;
}

export function CurrentCard({ card, selected, onClick, isAnimating = false }: CurrentCardProps) {
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
      ) : (
        <div className={styles.empty}>
          <span>No card</span>
        </div>
      )}
    </div>
  );
}
