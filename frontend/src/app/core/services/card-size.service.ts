import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CardSizeService {

  constructor() { }

  public calculateCardSize(cardDivisor: CardGridDivisor): VideoCardSize {
    const cardWidth = 100 / cardDivisor.widthDivisor;
    const cardHeight = 100 / cardDivisor.heightDivisor;

    const extraShrink = cardDivisor.heightDivisor - cardDivisor.widthDivisor + 1;
    const uiCardWidth = 100 - 1.6 * ((cardDivisor.heightDivisor + extraShrink) * (cardDivisor.heightDivisor + 1));

    return {
      width: cardWidth,
      height: cardHeight,
      uiCardWidth
    };
  }

  public setCardSize(card: HTMLElement, cardSize: VideoCardSize) {
    const uiCard = card.querySelector('.ui.card') as HTMLDivElement;
    card.style.width = `${cardSize.width}%`;
    card.style.height = `${cardSize.height}%`;
    uiCard.style.width = `${cardSize.uiCardWidth}%`;
  }

  public calculateCardDivisor(cardCount: number): CardGridDivisor {
    let heightDivisor = Math.floor(Math.sqrt(cardCount));
    const widthDivisor = Math.ceil(Math.sqrt(cardCount));
    if (heightDivisor * widthDivisor < cardCount) {
      heightDivisor++;
    }

    return {
      heightDivisor,
      widthDivisor
    };
  }
}

export interface CardGridDivisor {
  heightDivisor: number;
  widthDivisor: number;
}

export interface VideoCardSize {
  width: number;
  height: number;
  uiCardWidth: number;
}
