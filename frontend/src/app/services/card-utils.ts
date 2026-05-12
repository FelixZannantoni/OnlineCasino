
export type CardColor = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES' | string;

export function getCardRank(cardName: string): string {
  if (!cardName) return '';
  
  const n = cardName.toLowerCase();
  const rankMap: Record<string, string> = {
    'ace': 'A',
    'king': 'K',
    'queen': 'Q',
    'jack': 'J',
    'ten': '10',
    'nine': '9',
    'eight': '8',
    'seven': '7',
    'six': '6',
    'five': '5',
    'four': '4',
    'three': '3',
    'two': '2'
  };
  
  return rankMap[n] || cardName;
}

export function getSuitSymbol(color: CardColor): string {
  if (!color) return '';
  const c = color.toUpperCase();
  switch (c) {
    case 'HEARTS': return '♥';
    case 'DIAMONDS': return '♦';
    case 'CLUBS': return '♣';
    case 'SPADES': return '♠';
    default: return '';
  }
}
