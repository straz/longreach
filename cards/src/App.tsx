import { useState, useEffect, useCallback } from 'react';
import { cards as allCards, Card as CardType } from './data/cards';
import { shuffle } from './utils/shuffle';
import { Deck } from './components/Deck/Deck';
import { CurrentCard } from './components/CurrentCard/CurrentCard';
import { DiscardPile } from './components/DiscardPile/DiscardPile';
import { AboutBox } from './components/AboutBox/AboutBox';
import { Hand } from './components/Hand/Hand';
import { Search } from './components/Search/Search';
import styles from './App.module.css';

function App() {
  const [deck, setDeck] = useState<CardType[]>([]);
  const [currentCard, setCurrentCard] = useState<CardType | null>(null);
  const [discardPile, setDiscardPile] = useState<CardType[]>([]);
  const [hand, setHand] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = useCallback(() => {
    const shuffledDeck = shuffle(allCards);

    setDeck(shuffledDeck);
    setCurrentCard(null);
    setDiscardPile([]);
    setHand([]);
    setSelectedCard(null);
    setIsAnimating(false);
  }, []);

  const drawNextCard = useCallback(() => {
    if (deck.length === 0) {
      setCurrentCard(null);
      setSelectedCard(null);
      return;
    }

    const [nextCard, ...remainingDeck] = deck;
    setDeck(remainingDeck);
    setCurrentCard(nextCard);
    setSelectedCard(nextCard);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  }, [deck]);

  const handleKeep = useCallback(() => {
    if (!currentCard) return;

    setHand(prev => [...prev, currentCard]);
    drawNextCard();
  }, [currentCard, drawNextCard]);

  const handleDiscard = useCallback(() => {
    if (!selectedCard) return;

    // Check if selected card is in the hand
    const isHandCard = hand.some(card => card.id === selectedCard.id);

    if (isHandCard) {
      // Remove from hand and add to discard pile
      setHand(prev => prev.filter(card => card.id !== selectedCard.id));
      setDiscardPile(prev => [...prev, selectedCard]);
      setSelectedCard(currentCard);
    } else if (currentCard && selectedCard.id === currentCard.id) {
      // Discard current card and draw next
      setDiscardPile(prev => [...prev, currentCard]);
      drawNextCard();
    }
  }, [selectedCard, hand, currentCard, drawNextCard]);

  const handleCardSelect = useCallback((card: CardType) => {
    setSelectedCard(card);
  }, []);

  const handleCurrentCardClick = useCallback(() => {
    if (currentCard) {
      setSelectedCard(currentCard);
    }
  }, [currentCard]);

  const handleDiscardPileClick = useCallback(() => {
    if (discardPile.length === 0) return;

    // If there's a selected card (current card or hand card), return it to the deck
    if (selectedCard) {
      const isHandCard = hand.some(card => card.id === selectedCard.id);
      const isCurrentCard = currentCard && selectedCard.id === currentCard.id;

      if (isCurrentCard) {
        // Return current card to top of deck
        setDeck(prev => [currentCard, ...prev]);
      } else if (isHandCard) {
        // Return hand card to top of deck
        setHand(prev => prev.filter(card => card.id !== selectedCard.id));
        setDeck(prev => [selectedCard, ...prev]);
      }
    }

    // Move top card from discard pile to current card position
    const topCard = discardPile[discardPile.length - 1];
    setDiscardPile(prev => prev.slice(0, -1));
    setCurrentCard(topCard);
    setSelectedCard(topCard);
  }, [discardPile, selectedCard, hand, currentCard]);

  const handleSearchSelect = useCallback((card: CardType) => {
    // Check where the card is located
    const isInHand = hand.some(c => c.id === card.id);
    const isCurrentCard = currentCard?.id === card.id;
    const isInDeck = deck.some(c => c.id === card.id);
    const isInDiscardPile = discardPile.some(c => c.id === card.id);

    if (isCurrentCard) {
      // Already the current card, just select it
      setSelectedCard(card);
    } else if (isInHand) {
      // Card is in hand - select it and scroll to it
      setSelectedCard(card);
      // Scroll to the card after a brief delay to allow state update
      setTimeout(() => {
        const cardElement = document.getElementById(`hand-card-${card.id}`);
        cardElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    } else if (isInDeck || isInDiscardPile) {
      // Card is buried - return current selected card to deck, pull out chosen card

      // First, return the current card to top of deck (if there is one)
      if (currentCard) {
        setDeck(prev => [currentCard, ...prev]);
      }

      // Remove the card from wherever it is
      if (isInDeck) {
        setDeck(prev => prev.filter(c => c.id !== card.id));
      } else {
        setDiscardPile(prev => prev.filter(c => c.id !== card.id));
      }

      // Set it as the current card
      setCurrentCard(card);
      setSelectedCard(card);
    }
  }, [hand, currentCard, deck, discardPile]);

  const isCurrentCardSelected = selectedCard?.id === currentCard?.id;
  const isHandCardSelected = selectedCard ? hand.some(card => card.id === selectedCard.id) : false;
  const topDiscardCard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const isDiscardTopSelected = selectedCard?.id === topDiscardCard?.id;
  const canDiscard = (isCurrentCardSelected && currentCard !== null) || isHandCardSelected;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Longreach logo" className={styles.logo} />
          <h1>AI Pathologies</h1>
        </div>
        <Search cards={allCards} onSelectCard={handleSearchSelect} />
        <button className={styles.newGameButton} onClick={startNewGame}>
          New game
        </button>
      </header>

      {/* Main content: About Box on left spanning all rows, right side has card area and hand */}
      <div className={styles.mainContent}>
        <AboutBox card={selectedCard} />
        <div className={styles.rightColumn}>
          <div className={styles.cardArea}>
            <Deck count={deck.length} />
            <div className={styles.arrow}>→</div>
            <div className={styles.currentCardColumn}>
              <CurrentCard
                card={currentCard}
                selected={isCurrentCardSelected}
                onClick={handleCurrentCardClick}
                isAnimating={isAnimating}
                deckHasCards={deck.length > 0}
                onDrawCard={drawNextCard}
              />
              <button
                className={styles.keepButton}
                onClick={handleKeep}
                disabled={!isCurrentCardSelected || !currentCard}
                title="Keep card (add to hand)"
              >
                <span>Keep</span>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 16l-6-6h12z" />
                </svg>
              </button>
            </div>
            <button
              className={styles.discardButton}
              onClick={handleDiscard}
              disabled={!canDiscard}
              title="Discard card"
            >
              <span>Discard</span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M10 6l6 6-6 6z" />
              </svg>
            </button>
            <DiscardPile
              count={discardPile.length}
              topCard={topDiscardCard}
              isTopCardSelected={isDiscardTopSelected}
              onClick={handleDiscardPileClick}
            />
          </div>
          <Hand
            cards={hand}
            selectedCardId={selectedCard?.id ?? null}
            onCardClick={handleCardSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
