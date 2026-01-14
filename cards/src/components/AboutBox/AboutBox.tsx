import { Card as CardType } from '../../data/cards';
import styles from './AboutBox.module.css';

interface AboutBoxProps {
  card: CardType | null;
}

export function AboutBox({ card }: AboutBoxProps) {
  return (
    <div className={`${styles.aboutBox} ${card ? styles.hasCard : ''}`}>
      <div className={styles.content}>
        {card ? (
          <>
            <div className={styles.category}>{card.category}</div>
            <div className={styles.title}>{card.name}</div>
            <div className={styles.description}>{card.description}</div>
          </>
        ) : (
          <div className={styles.placeholder}>Select a card to see its description</div>
        )}
      </div>
    </div>
  );
}
