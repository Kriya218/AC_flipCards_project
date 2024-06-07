const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}


const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const controller = {
  currentState: GAME_STATE.FirstCardAwaits, //初始狀態
  
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //針對不同狀態，執行不同行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch(this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        
        //判斷配對是否成功
        if(model.isRevealedCardsMatch()) {
          //配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(model.revealedCards)
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
          if(model.score === 260) {
            console.log('ShowGameFinished');
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return
          }
        }else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.current state: ', this.currentState);
    console.log('reveal cards: ', model.revealedCards)
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}

const model = {
  score: 0,
  triedTimes: 0,
  revealedCards: [],
  isRevealedCardsMatch() {
    return this.revealedCards[0].dataset.index % 13 == this.revealedCards[1].dataset.index % 13
  }
}

const view = {
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },

  getCardContent(index) {
    const number = this.transFormNumber((index % 13)+1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
    <p>${number}</p>
    <img src="${symbol}" alt="symbol-">
    <p>${number}</p>
    `
  },

  transFormNumber (number) {
    switch(number) {
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
    rootElement.innerHTML = indexes.map(index =>this.getCardElement(index)).join('');
  },

  flipCards(...cards) { 
    cards.map(card => {
      //已在背面 ---> 回傳正面
      if(card.classList.contains('back')) {
      card.classList.remove('back');
      card.innerHTML = this.getCardContent(Number(card.dataset.index));
      return
      }
      //在正面 ---> 回傳背面
      card.classList.add('back');
      card.innerHTML = null;
    })
  },

  pairCards(cards) {
    console.log("typeof paircARDS:",typeof cards)
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").innerText = `You've tried: ${times} times`
  },

  appendWrongAnimation(cards) {
    cards.map(card => {
      card.classList.add("wrong");
      card.addEventListener('animationend', event => event.target.classList.remove("wrong"), {once: true});
    })
  },

  showGameFinished() {
    const div = document.createElement('div');
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector("#header")
    header.before(div);
  },
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length-1; index>0; index--) {
      let randomIndex = Math.floor(Math.random()*(index + 1));
      [number[index],number[randomIndex]] = [number[randomIndex],number[index]]
    }
    return number;
  }
}

controller.generateCards();


document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card);
    console.log("is card click0 array", Array.isArray(card))
  })
  
})