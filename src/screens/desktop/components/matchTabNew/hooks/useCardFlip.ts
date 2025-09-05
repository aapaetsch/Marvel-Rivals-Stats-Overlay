import { useState, useCallback } from 'react';
import { CardFlipState } from '../types/MatchCardTypes';

export const useCardFlip = () => {
  const [flippedCards, setFlippedCards] = useState<CardFlipState>({});

  const toggleCard = useCallback((cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  }, []);

  const resetAllCards = useCallback(() => {
    setFlippedCards({});
  }, []);

  const isCardFlipped = useCallback((cardId: string) => {
    return flippedCards[cardId] || false;
  }, [flippedCards]);

  return {
    flippedCards,
    toggleCard,
    resetAllCards,
    isCardFlipped
  };
};