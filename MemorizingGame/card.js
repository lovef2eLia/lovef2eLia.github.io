// Model
// 資料管理
const modal = {
  revealedCards: [],
  isRevealedCardMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
  score: 0,
  triedTimes: 0,
};

const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished',
};

// view
// 常數儲存的資料不會變動，因此習慣上將首字母大寫以表示此特性。
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png', // 梅花
];

const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`;
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];

    return `
    <p>${number}</p>
    <img src="${symbol}">
    <p>${number}</p>`
  `;
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return number;
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards');
    let raw = indexes.map((index) => this.getCardElement(index)).join('');
    rootElement.innerHTML = raw;
  },
  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains('back')) {
        card.classList.remove('back');
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      card.classList.add('back');
      card.innerHTML = null;
    });
  },
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add('paired');
    });
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(
      '.tried'
    ).textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add('wrong');
      card.addEventListener(
        'animationend',
        (e) => {
          e.target.classList.remove('wrong');
        },
        { once: true }
      );
    });
  },
  showGameFinished() {
    const div = document.createElement('div');

    div.classList.add('completed');
    div.innerHTML = `<p>Completed!</p>
    <p>Score: ${modal.score}</p>
    <p>You've tried ${modal.triedTimes} times</p>`;

    const HEADER = document.querySelector('#header');

    HEADER.before(div);
  },
};

//控制view model
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  //根據不同狀態（state）做不同任務
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return;
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        modal.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++modal.triedTimes);
        view.flipCards(card);
        modal.revealedCards.push(card);
        if (modal.isRevealedCardMatched()) {
          view.renderScore((modal.score += 10));
          this.currentState = GAME_STATE.CardMatched;
          view.pairCards(...modal.revealedCards);
          modal.revealedCards = [];

          if (modal.score === 260) {
            console.log('showGameFinished');
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          this.currentState = GAME_STATE.CardMatchFailed;
          view.appendWrongAnimation(...modal.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
    console.log('current state: ' + this.currentState);
    console.log(
      'revealed cards: ' + modal.revealedCards.map((card) => card.dataset.index)
    );
  },
  resetCards() {
    console.log('reset cards!');
    view.flipCards(...modal.revealedCards);
    modal.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }

    return number;
  },
};

controller.generateCards();

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', (event) => {
    controller.dispatchCardAction(card);
  });
});
