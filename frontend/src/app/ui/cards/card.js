/**
 * Spielkarten-Generator
 * Einfache Funktion zum Erstellen von Karten-HTML
 * 
 * Verwendung:
 * const card = createCard('A', 'hearts');
 * const card = createCard('7', 'diamonds', 'card-lg');
 * const card = createCard('K', 'spades', '', true); // Rückseite
 */

export function createCard(rank, suit, sizeClass = '', isBack = false) {
  const suitClasses = {
    hearts: 'card-hearts suit-hearts',
    diamonds: 'card-diamonds suit-diamonds',
    clubs: 'card-clubs suit-clubs',
    spades: 'card-spades suit-spades'
  };

  const card = document.createElement('div');
  card.className = `card ${suitClasses[suit] || ''} ${sizeClass}`.trim();
  
  if (isBack) {
    card.classList.add('card-back');
  }

  if (!isBack) {
    card.innerHTML = `
      <div class="card-top">
        <span class="card-rank">${rank}</span>
        <span class="card-suit suit-${suit}"></span>
      </div>
      <div class="card-center suit-${suit}"></div>
      <div class="card-bottom">
        <span class="card-rank">${rank}</span>
        <span class="card-suit suit-${suit}"></span>
      </div>
    `;
  }

  return card;
}

/**
 * Erstellt einen Karten-Container mit individueller Positionierung
 */
export function createCardContainer(cardElement, rotation = 0, x = 0, y = 0) {
  const container = document.createElement('div');
  container.className = 'card-container';
  container.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
  
  if (cardElement) {
    container.appendChild(cardElement);
  }
  
  return container;
}

/**
 * Hilfsfunktion: Karte an ein Element anhängen
 */
export function appendCardTo(element, rank, suit, options = {}) {
  const {
    size = '',
    rotation = 0,
    x = 0,
    y = 0,
    isBack = false
  } = options;

  const card = createCard(rank, suit, size, isBack);
  const container = createCardContainer(card, rotation, x, y);
  
  element.appendChild(container);
  
  return container;
}
