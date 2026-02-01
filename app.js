  const tg = window.Telegram.WebApp;
  tg.expand();

  if (!tg.initDataUnsafe?.user) {
    alert("Відкрий гру через Telegram");
    throw new Error("No Telegram user");
  }

  const myTgId = 7397166312; //tg.initDataUnsafe.user.id;
  const urlParams = new URLSearchParams(window.location.search);
  const chatId = urlParams.get('chatId');

  if (!chatId) {
    alert("Немає chatId. Відкрий гру з групи / чату");
    throw new Error("No chatId");
  }
  const API = 'https://server-monopoly-tg.onrender.com';
  let isAnimatingMove = false;
  let pendingRoom = null;

  function debug(msg) {
  let d = document.getElementById("debug");
  if (!d) {
    d = document.createElement("pre");
    d.id = "debug";
    d.style.position = "fixed";
    d.style.bottom = "0";
    d.style.left = "0";
    d.style.right = "0";
    d.style.maxHeight = "40%";
    d.style.overflow = "auto";
    d.style.background = "#000";
    d.style.color = "#0f0";
    d.style.fontSize = "12px";
    d.style.padding = "8px";
    d.style.zIndex = "99999";
    document.body.appendChild(d);
  }
  d.textContent += msg + "\n";
}

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
  let players = [
  ]
  let myPlayerIndex = -1;
  const playersBox = document.getElementById("players");
  const rollBtn = document.getElementById("rollBtn");
  const diceResult = document.getElementById("diceResult");
  let currentTurn = 0;

  function renderPlayers() {
    playersBox.querySelectorAll(".player").forEach(p => p.remove());
    diceResult.innerText = "";

    document.querySelectorAll(".token").forEach(t => t.remove());

    players.forEach((p, i) => {
      const div = document.createElement("div");
      div.className = "player" + (i === currentTurn ? " active" : "");
      div.style.borderLeftColor = p.active ? p.color : 'gray';  
      div.style.opacity = p.active ? 1 : 0.5;

      div.innerHTML = `
        <b>${p.name}</b>
        <div class="money">💰 ${p.money}</div>
        `;

      playersBox.appendChild(div);

      const sameCellPlayers = players.filter(pl => pl.pos === p.pos);
      const index = sameCellPlayers.indexOf(p);
      addToken(p.pos, p.active ? p.color : 'gray', index);
    });

    updateRollButton();
    updateActionButtons();
  }

  /* Тестові фішки */
  function addToken(cellId, color, indexInCell) {
  const cell = document.querySelector(`[data-id='${cellId}']`);
  if (!cell) return;

  const token = document.createElement("div");
  token.className = `token ${color}`;

  const offset = indexInCell * 8;
  token.style.left = offset + "px";
  token.style.top = offset + "px";
  console.log("TOKEN:", cellId, color, indexInCell);

  cell.appendChild(token);
  }

  rollBtn.addEventListener("click", rollDice);
  let isRolling = false;

  async function rollDice() {
    debug("---- ROLL CLICK ----");

    debug("myTgId = " + myTgId);
    debug("currentTurn = " + currentTurn);
    debug("players[currentTurn]?.id = " + players[currentTurn]?.id);

    if (isRolling) {
      debug("BLOCK: isRolling");
      return;
    }

    const turnTgId = Number(players[currentTurn]?.id);
    if (!Number.isFinite(turnTgId)) {
      debug("BLOCK: turnId invalid (NaN)");
      return;
    }
    if (turnTgId !== myTgId) {
      debug("BLOCK: NOT YOUR TURN");
      return;
    }

    isRolling = true;
    try {
      const d1 = rand(1,6);
      const d2 = rand(1,6);
      const steps = d1 + d2;

      diceResult.innerText = `🎲 ${d1} + ${d2} = ${steps}`;

      const r = await fetch(`${API}/room/${chatId}/move`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          playerId: Number(myTgId),
          steps
        })
      });

      debug("MOVE status=" + r.status);


      if (!r.ok) {
        const t = await r.text().catch(() => '');
        debug("MOVE ERROR " + r.status + ": " + t);
        alert(`MOVE ERROR ${r.status}: ${t}`);
        return;
      }

      debug(`AFTER MOVE click: myTgId=${myTgId} turnTgId=${players[currentTurn]?.id}`);

      await syncRoom();
    } finally {
      isRolling = false;
    }
  }


  function rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  function updateRollButton() {
      const turnId = Number(players[currentTurn]?.id);
      rollBtn.style.display = (turnId === Number(myTgId)) ? "block" : "none";
  }


  function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function connectToServer() {
    const res = await fetch(`${API}/room/${chatId}/state`);
    if(!res.ok) {
      document.body.innerHTML = `
      <h1 style="text-aling:center;margin-top:50px;">
        ⛔ Гру завершено
        </h1>
        <p style="text-aling:center;">Поверніться до Telegram</p>
        `;
        return;
    }

    const room = await res.json();

    if(!room.active) {
      document.body.innerHTML = `
      <h1 style="text-aling:center;margin-top:50px;">
        ⛔ Гру завершено
        </h1>
        <p style="text-aling:center;">Поверніться до Telegram</p>
        `;
        return;
    }

    await applyRoom(room);
  }


  async function syncRoom() {
    try {
      const res = await fetch(`${API}/room/${chatId}/state`);
      if(!res.ok) return;

      const room = await res.json();
      debug("SYNC: got room");
      debug("SYNC currentTurn=" + room.currentTurn + " raw=" + room.current_turn);
      if (!room.players) return;

      if (isAnimatingMove) {
        pendingRoom = room;
        return;
      }

      await applyRoom(room);
    } catch (e) {
      console.error(e);
    }
  }

  async function applyRoom(room) {
    debug("=== APPLY ROOM ===");
    debug("room.currentTurn = " + room.currentTurn);
    debug("players from server:");

    room.players.forEach(p => {
      debug(" - server player tg_id=" + p.id + " pos=" + p.pos);
    });
    if (players.length === 0) {
      players = room.players.map(p => ({ ...p, id: Number(p.id) }));
      currentTurn = Number(room.currentTurn);
      myPlayerIndex = players.findIndex(p => p.id === Number(myTgId));
      renderPlayers();
      return;
    }

    isAnimatingMove = true;
    await animateTo(room.players);
    currentTurn = Number(room.currentTurn);
    myPlayerIndex = players.findIndex(p => p.id === Number(myTgId));
    for (const sp of room.players) {
      const p = players.find(pl => pl.id === Number(sp.id));
      if (!p) continue;
      p.pos = Number(sp.pos);
      p.money = sp.money;
      p.active = sp.active;
      p.color = sp.color;
    }
    isAnimatingMove = false;

    renderPlayers();
    updateActionButtons();
    updateRollButton();

    if (pendingRoom) {
      const r = pendingRoom;
      pendingRoom = null;
      await applyRoom(r);
    }
  }


  async function animateTo(serverPlayers) {
    for (const sp of serverPlayers) {
      const p = players.find(pl => pl.id === Number(sp.id));
      if (!p) continue;

      const spPos = Number(sp.pos);
      let steps = (spPos - p.pos + 40) % 40;
      for (let s = 0; s < steps; s++) {
        p.pos = (p.pos + 1) % 40;
        renderPlayers();
        await sleep(200);
      }
    }
  }

  const surrenderBtn = document.getElementById('surrenderBtn');

  surrenderBtn.addEventListener('click', async () => {
    const confirmSurrender = confirm("Ви дійсно хочете здатися?");
    if(!confirmSurrender) return;
    if(currentTurn !== myPlayerIndex) return;

    await fetch(`${API}/room/${chatId}/surrender`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ playerId: myTgId})
    });

    await syncRoom();
  });

  const tradeBtn = document.getElementById('tradeBtn');

  tradeBtn.addEventListener('click', () => {
    alert("В розробці");
  });

  function updateActionButtons() {
    const me = players[myPlayerIndex];
    if(!me) return;

    const catAct = currentTurn === myPlayerIndex && me.active;

    surrenderBtn.style.display = catAct ? "inline-block" : "none";
    tradeBtn.style.display = catAct ? "inline-block" : "none";
  }

  connectToServer();
  setInterval(syncRoom, 2000);
