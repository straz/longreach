import { Card as CardType } from '../../data/cards';
import styles from './AboutBox.module.css';

interface AboutBoxProps {
  card: CardType | null;
}

function getCardImagePath(card: CardType): string {
  // Convert category: "Congenital & Genetic" -> "congenital---genetic"
  const categorySlug = card.category
    .toLowerCase()
    .replace(/ & /g, '---')
    .replace(/ /g, '-');

  // Convert name: "Reward Hacking (Accidental)" -> "reward-hacking--accidental-"
  // Parentheses become dashes, spaces become dashes
  const nameSlug = card.name
    .toLowerCase()
    .replace(/ & /g, '---')
    .replace(/[()]/g, '-')
    .replace(/ /g, '-');

  return `/cards/images/cards/${categorySlug}_${nameSlug}.png`;
}

export function AboutBox({ card }: AboutBoxProps) {
  return (
    <div className={`${styles.aboutBox} ${card ? styles.hasCard : ''}`}>
      <div className={styles.content}>
        {card ? (
          <>
            <img
              src={getCardImagePath(card)}
              alt={card.name}
              className={styles.cardImage}
            />
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
