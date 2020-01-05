const decks = [goalSetDeck, goalGetDeck, circDeck, quoteDeck]
const text = [['a', 'b', 'c'], [], [], []]

function flipCard(deck) {
  glass.append(movingCard)
  movingCard.querySelector('.front').innerText = decks[deck].children[0].innerText
  const cardText = movingCard.querySelector('.back').innerText = text[deck].pop()
  movingCard.classList.remove('animate')
  cardWrap.classList.remove('flipped', 'animate')
  let { x, y, width } = decks[deck].children[0].getBoundingClientRect()
  movingCard.style.left = x + 'px'
  movingCard.style.top = y + 'px'
  setTimeout(() => {
    movingCard.classList.add('animate')
    cardWrap.classList.add('flipped', 'animate')
      ; ({ x, y } = openCard.getBoundingClientRect())
    movingCard.style.left = x + width + 'px'
    movingCard.style.top = y + 'px'
    cardWrap.ontransitionend = () => {
      openCard.innerText = cardText
      off.append(movingCard)
    }

  }, 0)



}