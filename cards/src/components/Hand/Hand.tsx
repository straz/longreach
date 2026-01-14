import { Card as CardType } from '../../data/cards';
import { Card } from '../Card/Card';
import styles from './Hand.module.css';

interface HandProps {
  cards: CardType[];
  selectedCardId: string | null;
  onCardClick: (card: CardType) => void;
}

export function Hand({ cards, selectedCardId, onCardClick }: HandProps) {
  return (
    <div className={styles.hand}>
      <div className={styles.label}>Your Hand ({cards.length})</div>
      <div className={styles.cards}>
        {cards.length > 0 ? (
          cards.map((card) => (
            <div key={card.id} id={`hand-card-${card.id}`}>
              <Card
                card={card}
                faceUp={true}
                selected={card.id === selectedCardId}
                onClick={() => onCardClick(card)}
              />
            </div>
          ))
        ) : (
          <div className={styles.empty}>No cards in hand yet</div>
        )}
      </div>
    </div>
  );
}
