import { ValentineCard } from './types';

const STORAGE_KEY = 'valentine_cards';

export function generateCardId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

// Legacy localStorage functions - kept for backward compatibility but no longer used
// The app now uses Supabase backend (see utils/api.ts)
export function saveCard(card: ValentineCard): void {
  const cards = getAllCards();
  cards[card.cardId] = card;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function getCard(cardId: string): ValentineCard | null {
  const cards = getAllCards();
  return cards[cardId] || null;
}

export function updateCard(cardId: string, updates: Partial<ValentineCard>): void {
  const cards = getAllCards();
  if (cards[cardId]) {
    cards[cardId] = { ...cards[cardId], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }
}

function getAllCards(): Record<string, ValentineCard> {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Prefetches images by loading them into the browser cache
 */
export function prefetchImages(urls: string[]) {
  urls.forEach(url => {
    if (!url || url === 'uploading') return;
    const img = new Image();
    img.src = url;
  });
}