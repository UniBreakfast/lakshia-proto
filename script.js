const { assign } = Object, { random } = Math, { parse, stringify } = JSON,
c = console.log

const decks = [goalSetDeck, goalGetDeck, circDeck, quoteDeck]
const texts = [[], [], [], [], []]

const deckShadow =
  (pos, cards) => [...Array(cards).keys()].map(i => {
    if (pos==4) return '0 ' + .1*i + 'vh 0 ' + -(i/30).toFixed(2) + 'vh'
    if (pos==9) return -.1*i + 'vw 0 0 ' + -(i/30).toFixed(2) + 'vw'
    if (pos<4) return [2, .65, -.65, -2][pos]*.1*i + 'vh ' +
      -.1*i + 'vh 0 ' + -(i/30).toFixed(2) + 'vh'
    else return  .1*i + 'vw ' + [1.4, .65, -.65, -1.4][pos-5]*.1*i +
      'vw 0 ' + -(i/30).toFixed(2) + 'vw'
  }).join(', ')

openCard.upd = cards => {
  openCard.style.setProperty('--hor', deckShadow(4, cards))
  openCard.style.setProperty('--vert', deckShadow(9, cards))
}


function flipCard(deck) {
  const vert = innerWidth<innerHeight,
      deckClass = ['goalSet', 'goalGet', 'circ', 'quote'][deck],
      backClass = ['goalSetBack', 'goalGetBack', 'circBack', 'quoteBack'][deck]
  glass.classList.add('active')
  glass.append(movingCard)
  front.innerText = decks[deck].children[0].innerText
  const card = texts[deck].splice(Math.random()*texts[deck].length|0, 1)[0]
  if (card.author)
    back.innerHTML = `"${card.text}"<p>- ${card.author} &nbsp;</p>`
  else back.innerText = card.text
  front.classList.add(deckClass)
  back.classList.add(backClass)
  movingCard.classList.remove('animate')
  cardWrap.classList.remove('flipped', 'animate')
  const { x, y } = decks[deck].children[0].getBoundingClientRect()
  assign(movingCard.style, {left: x+'px', top: y+'px'})
  setTimeout(() => {
    back.classList.add('backUp', backClass)
    cardWrap.classList.add('flipped', 'animate')
    movingCard.classList.add('animate', 'biggerCard')
    setTimeout(()=> movingCard.classList.remove('biggerCard') ||
                    back.classList.remove('backUp'), 750)
    const { x, y, width, height } = openCard.getBoundingClientRect()
    assign(movingCard.style, {left: x-(vert? width/2.02 : width/80)+'px',
                              top: y-(vert? height/80 : height/2.02)+'px'})
    cardWrap.ontransitionend =()=> {
      cardWrap.ontransitionend = null
      openCard.innerHTML = back.innerHTML
      off.append(movingCard)
      openCard.className = 'card bigCard '+backClass
      glass.classList.remove('active')
      front.classList.remove(deckClass)
      back.classList.remove(backClass)
      count[4] = Math.min(count[4]+1, 24)
      openCard.upd(count[4])
    }
  }, 0)
}

// simulation
let count = [36, 36, 36, 36, 0], phase = 0, log = [random()*10|0]
openCard.onclick = async ()=> {
  if (!Math.max(...count.slice(0,4))) return
  // do {
  //   var deck = Math.random()*4|0
  // } while (!count[deck])
  const deck = await jump()
  decks[deck].upd(count[deck]? --count[deck] : 0)
  if (!count[deck]) setTimeout(()=> decks[deck].classList.add('hidden'), 0)
  flipCard(deck)
}
decks.forEach(deck => deck.onclick = i => {
  i = decks.indexOf(deck)
  decks[i].upd(count[i]? --count[i] : 0)
  if (!count[i]) setTimeout(()=> deck.classList.add('hidden'), 0)
  flipCard(i)
})

hit.volume = .04

const
  save =()=> {
    const pool = texts.flatMap(deck => deck.map(card => card.id)),
          { innerText } = goal
    localStorage.progress = stringify({phase, goal: {innerText}, pool, log})
    c('saved')
  },
  load =()=> {
    const progress = parse(localStorage.progress)
    !({ phase, log } = progress)
    assign(goal, progress.goal)
    texts.splice(0, 5,...texts.map(deck =>
      deck.filter(card => progress.pool.includes(card.id))))

  },
  moveBall = async deck => {
    const { x, y, width, height } = decks[deck].getBoundingClientRect(),
          left = x + (random()*.6+.2)*width + 'px',
          top = y + (random()*.6+.2)*height + 'px'
    await Promise.all([
      new Promise(end => {
        assign(ball.style, {left, top})
        ball.ontransitionend = end
      }),
      new Promise(end => {
        glass.classList.add('rise')
        glass.onanimationend =()=> glass.classList.remove('rise') || end()
      })
    ])
  },
  jump = async ()=> {
    glass.classList = 'active'
    glass.append(ball)
    let last = random()*4|0
    for (let i=5; i; --i) {
      do { var deck = random()*4|0 }
      while (/* deck==last || */ !texts[deck].length)
      if (i==1) ball.classList.add('disappear')
      await moveBall(last = deck)
      hit.currentTime = 0;
      hit.play()
    }
    glass.classList = ''
    off.append(ball)
    ball.classList.remove('disappear')
    return last
  },
  phases = [
    async ()=> {

    }
  ],
  main = async ()=> {
    await loadCards()
    console.log('cards loaded')
    if (localStorage.progress) load()
  },

  loadCards = async ()=> {
    let id = 0
    const
      nl = lines => nl.is || (nl.is = lines.includes('\r\n')? '\r\n' : '\n'),
      getLines = arr => lines =>
        arr.push(...lines.split(nl(lines)).map(line => ({text: line}))),
      process = [getLines(texts[0]), getLines(texts[1]),
        lines => lines.split(nl(lines).repeat(2)).forEach((part, i) =>
          texts[2].push(...part.split(nl(lines)).map(line =>
            ({text: line, move: [1, 2, -1, -2][i]})))),
        lines => {
          lines = lines.split(nl(lines))
          for (let i=0; i<lines.length; i+=2)
            texts[3].push({text: lines[i], author: lines[i+1]})
        },
        getLines(texts[4])
      ]
    await Promise.all('goalSet, goalGet, circ, quote, reflect'.split(', ')
      .map((name, i) => fetch(`${i} ${name}.txt`).then(resp => resp.text())
        .then(process[i])))
    texts.forEach(deck => deck.forEach(card => card.id = ++id))
  }

main()

console.log(`http://127.0.0.1:5500/
https://unibreakfast.github.io/lakshia-proto/
https://github.com/UniBreakfast/lakshia-proto`)
