import { useNavigate } from 'react-router-dom';
import { Card as CardType } from '../../data/cards';
import { Card } from '../Card/Card';
import styles from './Hand.module.css';

interface HandProps {
  cards: CardType[];
  selectedCardId: string | null;
  onCardClick: (card: CardType) => void;
}

export function Hand({ cards, selectedCardId, onCardClick }: HandProps) {
  const navigate = useNavigate();

  const handleGetReport = () => {
    navigate('/request', { state: { cards } });
  };

  return (
    <div className={styles.hand}>
      <div className={styles.header}>
        <div className={styles.label}>Your Hand ({cards.length})</div>
        <button
          className={styles.reportButton}
          disabled={cards.length === 0}
          onClick={handleGetReport}
        >
          Get a free report
        </button>
      </div>
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
