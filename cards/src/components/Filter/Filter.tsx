import { useState, useRef, useEffect } from 'react';
import { categoryColors } from '../../data/cards';
import styles from './Filter.module.css';

interface FilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories = Object.keys(categoryColors);

export function Filter({ selectedCategory, onCategoryChange }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (category: string | null) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  const displayText = selectedCategory || 'Show all';
  const selectedColor = selectedCategory ? categoryColors[selectedCategory] : undefined;

  return (
    <div className={styles.filterContainer} ref={dropdownRef}>
      <button
        className={styles.filterButton}
        onClick={() => setIsOpen(!isOpen)}
        style={selectedColor ? { borderColor: selectedColor } : undefined}
      >
        <span className={styles.filterLabel}>Filter:</span>
        <span
          className={styles.filterValue}
          style={selectedColor ? { color: selectedColor } : undefined}
        >
          {displayText}
        </span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          <div
            className={`${styles.dropdownItem} ${!selectedCategory ? styles.selected : ''}`}
            onClick={() => handleSelect(null)}
          >
            Show all
          </div>
          {categories.map((category) => (
            <div
              key={category}
              className={`${styles.dropdownItem} ${selectedCategory === category ? styles.selected : ''}`}
              onClick={() => handleSelect(category)}
            >
              <span
                className={styles.colorDot}
                style={{ backgroundColor: categoryColors[category] }}
              />
              {category}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
