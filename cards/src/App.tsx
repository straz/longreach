import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { cards as allCards, Card as CardType, categoryColors } from './data/cards';
import { shuffle } from './utils/shuffle';
import { Deck } from './components/Deck/Deck';
import { CurrentCard } from './components/CurrentCard/CurrentCard';
import { DiscardPile } from './components/DiscardPile/DiscardPile';
import { AboutBox } from './components/AboutBox/AboutBox';
import { Hand } from './components/Hand/Hand';
import { Search } from './components/Search/Search';
import { Filter } from './components/Filter/Filter';
import { captureCampaignFromPath } from './lib/campaign';
import styles from './App.module.css';

function App() {
  const { campaign } = useParams<{ campaign?: string }>();
  const [deck, setDeck] = useState<CardType[]>([]);
  const [currentCard, setCurrentCard] = useState<CardType | null>(null);
  const [discardPile, setDiscardPile] = useState<CardType[]>([]);
  const [hand, setHand] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Capture campaign from URL and save to cookie
  useEffect(() => {
    captureCampaignFromPath(campaign);
  }, [campaign]);

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
    setCategoryFilter(null);
  }, []);

  const drawNextCard = useCallback((filter: string | null = categoryFilter) => {
    if (deck.length === 0) {
      setCurrentCard(null);
      setSelectedCard(null);
      return;
    }

    // Find the first card that matches the filter (or any card if no filter)
    let cardIndex = 0;
    if (filter) {
      cardIndex = deck.findIndex(card => card.category === filter);
      if (cardIndex === -1) {
        // No matching cards in deck
        setCurrentCard(null);
        setSelectedCard(null);
        return;
      }
    }

    const nextCard = deck[cardIndex];
    const remainingDeck = [...deck.slice(0, cardIndex), ...deck.slice(cardIndex + 1)];
    setDeck(remainingDeck);
    setCurrentCard(nextCard);
    setSelectedCard(nextCard);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  }, [deck, categoryFilter]);

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

  const handleCategoryChange = useCallback((newCategory: string | null) => {
    setCategoryFilter(newCategory);

    // Return all face-down cards from discard pile to deck (shuffled in randomly)
    // Face-down means all cards except the top card which is face-up
    const faceDownDiscardCards = discardPile.slice(0, -1);
    const topDiscardCardFromPile = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

    // Compute the new deck with face-down discard cards shuffled back in
    let newDeck = faceDownDiscardCards.length > 0
      ? shuffle([...deck, ...faceDownDiscardCards])
      : [...deck];

    // Compute new discard pile (only keep top card if any)
    let newDiscardPile = topDiscardCardFromPile ? [topDiscardCardFromPile] : [];

    // Track what the new current card should be
    let newCurrentCard = currentCard;
    let newSelectedCard = selectedCard;

    // If current card doesn't match the new filter, discard it and draw next matching card
    if (newCategory && currentCard && currentCard.category !== newCategory) {
      // Add current card to discard pile
      newDiscardPile = [...newDiscardPile, currentCard];

      // Find next matching card in the new deck
      const matchingIndex = newDeck.findIndex(card => card.category === newCategory);
      if (matchingIndex !== -1) {
        newCurrentCard = newDeck[matchingIndex];
        newSelectedCard = newCurrentCard;
        newDeck = [...newDeck.slice(0, matchingIndex), ...newDeck.slice(matchingIndex + 1)];
      } else {
        newCurrentCard = null;
        newSelectedCard = null;
      }
    }

    // Apply all state updates
    setDeck(newDeck);
    setDiscardPile(newDiscardPile);
    setCurrentCard(newCurrentCard);
    setSelectedCard(newSelectedCard);
  }, [deck, discardPile, currentCard, selectedCard]);

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
        <div className={styles.headerControls}>
          <Search cards={allCards} onSelectCard={handleSearchSelect} />
          <Filter selectedCategory={categoryFilter} onCategoryChange={handleCategoryChange} />
        </div>
        <button className={styles.newGameButton} onClick={startNewGame}>
          New game
        </button>
      </header>

      {/* Main content: About Box on left spanning all rows, right side has card area and hand */}
      <div className={styles.mainContent}>
        <AboutBox card={selectedCard} />
        <div className={styles.rightColumn}>
          <div className={styles.cardArea}>
            <Deck
              count={deck.length}
              filteredCount={categoryFilter ? deck.filter(c => c.category === categoryFilter).length : undefined}
              categoryColor={categoryFilter ? categoryColors[categoryFilter] : undefined}
            />
            <div className={styles.arrow}>→</div>
            <div className={styles.currentCardColumn}>
              <CurrentCard
                card={currentCard}
                selected={isCurrentCardSelected}
                onClick={handleCurrentCardClick}
                isAnimating={isAnimating}
                deckHasCards={categoryFilter
                  ? deck.some(card => card.category === categoryFilter)
                  : deck.length > 0}
                onDrawCard={() => drawNextCard()}
              />
              <div className={styles.buttonRow}>
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
                <button
                  className={`${styles.discardButton} ${styles.mobileOnly}`}
                  onClick={handleDiscard}
                  disabled={!canDiscard}
                  title="Discard card"
                >
                  <span>Discard</span>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M10 6l6 6-6 6z" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              className={`${styles.discardButton} ${styles.desktopOnly}`}
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
