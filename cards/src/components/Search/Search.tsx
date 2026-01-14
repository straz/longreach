import { useState, useRef, useEffect } from 'react';
import { Card as CardType } from '../../data/cards';
import styles from './Search.module.css';

interface SearchResult {
  card: CardType;
  matchField: 'name' | 'description';
  matchIndex: number;
  contextBefore: string;
  matchedText: string;
  contextAfter: string;
}

interface SearchProps {
  cards: CardType[];
  onSelectCard: (card: CardType) => void;
}

export function Search({ cards, onSelectCard }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const card of cards) {
      // Search in name
      const nameIndex = card.name.toLowerCase().indexOf(lowerQuery);
      if (nameIndex !== -1) {
        const start = Math.max(0, nameIndex - 12);
        const end = Math.min(card.name.length, nameIndex + query.length + 12);
        searchResults.push({
          card,
          matchField: 'name',
          matchIndex: nameIndex,
          contextBefore: (start > 0 ? '...' : '') + card.name.slice(start, nameIndex),
          matchedText: card.name.slice(nameIndex, nameIndex + query.length),
          contextAfter: card.name.slice(nameIndex + query.length, end) + (end < card.name.length ? '...' : ''),
        });
      }

      // Search in description
      const descIndex = card.description.toLowerCase().indexOf(lowerQuery);
      if (descIndex !== -1) {
        const start = Math.max(0, descIndex - 12);
        const end = Math.min(card.description.length, descIndex + query.length + 12);
        searchResults.push({
          card,
          matchField: 'description',
          matchIndex: descIndex,
          contextBefore: (start > 0 ? '...' : '') + card.description.slice(start, descIndex),
          matchedText: card.description.slice(descIndex, descIndex + query.length),
          contextAfter: card.description.slice(descIndex + query.length, end) + (end < card.description.length ? '...' : ''),
        });
      }
    }

    setResults(searchResults);
    setIsOpen(searchResults.length > 0);
  }, [query, cards]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    onSelectCard(result.card);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className={styles.searchContainer}>
      <input
        ref={inputRef}
        type="text"
        className={styles.searchInput}
        placeholder="Search cards..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
      />
      {isOpen && results.length > 0 && (
        <div ref={dropdownRef} className={styles.dropdown}>
          {results.map((result, index) => (
            <div
              key={`${result.card.id}-${result.matchField}-${index}`}
              className={styles.dropdownItem}
              onClick={() => handleSelect(result)}
            >
              <div className={styles.cardName}>{result.card.name}</div>
              <div className={styles.matchContext}>
                <span>{result.contextBefore}</span>
                <strong>{result.matchedText}</strong>
                <span>{result.contextAfter}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
