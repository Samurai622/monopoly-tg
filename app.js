
const tg = window.Telegram.WebApp;
tg.expand();


  /* Масив клітинок з назвами і фон-картинками */
  const cellsData = [
    {name:"Start", img:"images/start.png"},
    {name:"Marvel", img:"images/marvel.png"},
    {name:"Pixar", img:"images/pixar.png"},
    {name:"Task", img:"images/task(down).png"},
    {name:"GiveUser", img:"images/giveuser.png"},
    {name:"Audi", img:"images/audi.png"},
    {name:"Sprite", img:"images/sprite.png"},
    {name:"Fanta", img:"images/fanta.png"},
    {name:"Minecraft", img:"images/minecraft.png"},
    {name:"CocaCola", img:"images/cocacola.png"},
    
    {name:"Casino", img:"images/casino.png"},
    {name:"Starbucks", img:"images/starbucks.png"},
    {name:"Task", img:"images/task(left).png"},
    {name:"Blue Bottle Coffee", img:"images/bluebottlecoffee.png"},
    {name:"Lavazza", img:"images/lavazza.png"},
    {name:"BMW", img:"images/bmw.png"},
    {name:"McDonalds", img:"images/mcdonalds.png"},
    {name:"KFS", img:"images/kfs.png"},
    {name:"Task", img:"images/task(left).png"},
    {name:"Pizza Hut", img:"images/pizza hut.png"},
    
    {name:"Jail", img:"images/jail.png"},
    {name:"Telegram", img:"images/telegram.png"},
    {name:"WhatsApp", img:"images/whatsapp.png"},
    {name:"Instagram", img:"images/instagram.png"},
    {name:"Task", img:"images/task(down).png"},
    {name:"Lamborghini", img:"images/lamborghini.png"},
    {name:"Give to bank", img:"images/givebank.png"},
    {name:"Apple", img:"images/apple.png"},
    {name:"Task", img:"images/task(down).png"},
    {name:"PlayStation", img:"images/ps.png"},

    {name:"GoJail", img:"images/gojail.png"},
    {name:"Yakuza", img:"images/yakuza.png"},
    {name:"Assassin's Creed", img:"images/ac.png"},
    {name:"Cosa Nostra", img:"images/cosa nostra.png"},
    {name:"Triads", img:"images/triads.png"},
    {name:"Mersedes-Benz", img:"images/mercedes-benz.png"},
    {name:"Gucci", img:"images/gucci.png"},
    {name:"Task", img:"images/task(right).png"},
    {name:"Nike", img:"images/nike.png"},
    {name:"Adidas", img:"images/adidas.png"}
  ];

  const board = document.getElementById("board");
  const cells = [];


  cellsData.forEach((data, i) => {
    const cell = document.createElement("div");
    cell.className = `cell`;
    cell.dataset.id = i;
    cell.style.backgroundImage = `url('${data.img}')`; // фонова картинка
    cells.push(cell);
    board.appendChild(cell);
  });

  /* Розкладка клітинок по 11x11 */
  cells.forEach((cell, i) => {
    let row, col;

    if (i <= 10) {             // низ
      row = 11;
      col = 11 - i;
    } else if (i <= 20) {      // ліво
      row = 21 - i;
      col = 1;
    } else if (i <= 30) {      // верх
      row = 1;
      col = i - 19;
    } else {                   // право
      row = i - 29;
      col = 11;
    }

    cell.style.gridRow = row;
    cell.style.gridColumn = col;
  });

  const players = [
    {name: "Player 1", color: "red", money: 1500, pos: 0},
    {name: "Player 2", color: "blue", money: 1500, pos: 0}
  ]

  const playersBox = document.getElementById("players");

  let currentTurn = 0;

  function renderPlayers() {
    playersBox.innerHTML = "<h2>Гравці</h2>";

    document.querySelectorAll(".token").forEach(t => t.remove());

    players.forEach((p, i) => {
        const div = document.createElement("div");
        div.className = "player" + (i === currentTurn ? " active" : "");
        div.style.borderLeftColor = p.color;

        div.innerHTML = `
        <b>${p.name}</b>
        <div class="money">💰 ${p.money}</div>
        `;

        playersBox.appendChild(div);
        addToken(p.pos, p.color);
    });
  }
    renderPlayers();


  /* Тестові фішки */
  function addToken(cellId, color) {
    const cell = document.querySelector(`[data-id='${cellId}']`);
    if (!cell) return;

    const token = document.createElement("div");
    token.className = `token ${color}`;
    cell.appendChild(token);
  }

    const rollBtn = document.getElementById("rollBtn");
    const diceResult = document.getElementById("diceResult");

    rollBtn.addEventListener("click", rollDice);

    function rollDice() {
    const d1 = rand(1, 6);
    const d2 = rand(1, 6);
    const steps = d1 + d2;

    diceResult.innerText = `🎲 ${d1} + ${d2} = ${steps}`;

    movePlayer(currentTurn, steps);

    // наступний гравець
    currentTurn = (currentTurn + 1) % players.length;
    renderPlayers();
    }

    function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function movePlayer(playerIndex, steps) {
      players[playerIndex].pos =
        (players[playerIndex].pos + steps) % cellsData.length;
    }