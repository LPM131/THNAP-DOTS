document.addEventListener('DOMContentLoaded', () => {
    const mainGrid = document.getElementById('main-grid');
    const title = document.querySelector('h1') || document.createElement('h1');

    // Show main grid and hide feature view
    function showMainGrid() {
        if (title) title.textContent = 'DOTS';
        if (mainGrid) mainGrid.style.display = 'grid';

        const featureView = document.getElementById('feature-view');
        if (featureView) featureView.remove();

        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.classList.add('hidden'));
    }

    // Show feature
    function showFeature(dotId) {
        const featureMap = {
            1: openChat,
            11: openWordle,
            13: openPokemon,
            12: openCrossword
        };
        const openFunction = featureMap[dotId];
        if (openFunction) {
            if (title) title.textContent = '';
            if (mainGrid) mainGrid.style.display = 'none';
            openFunction();
        }
    }

    // Dot click handling
    if (mainGrid) {
        mainGrid.addEventListener('click', (e) => {
            const dot = e.target.closest('.dot');
            if (!dot) return;
            const dotId = dot.getAttribute('data-id');
            if (dotId) showFeature(Number(dotId));
        });
    }

    showMainGrid();
});

// ---------------------------
// BACK BUTTON
// ---------------------------
function backToMain() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    const mainGrid = document.getElementById('main-grid');
    const title = document.querySelector('h1');
    if (mainGrid) mainGrid.style.display = 'grid';
    if (title) title.textContent = 'DOTS';
}

// ---------------------------
// CHAT MODULE
// ---------------------------
const chatModal = document.getElementById("chat-modal");
const threadArea = document.getElementById("thread-area");
const chatArea = document.getElementById("chat-area");
const messages = document.getElementById("messages");
const chatInput = document.getElementById("chat-input");

const threadNames = ["Bot", "Friend 1", "Friend 2"];
let threadsData = { "Bot": { x: 40, y: 40 }, "Friend 1": { x: 160, y: 200 }, "Friend 2": { x: 100, y: 350 } };
let velocities = {};

function openChat() {
    chatModal.classList.remove("hidden");
    renderThreadDots();
    initPhysics();
}

function renderThreadDots() {
    threadArea.innerHTML = "";
    threadNames.forEach(name => {
        const dot = document.createElement("div");
        dot.classList.add("thread-dot");
        dot.textContent = name[0];
        dot.style.left = threadsData[name].x + "px";
        dot.style.top = threadsData[name].y + "px";
        dot.addEventListener("click", () => openThread(name));
        threadArea.appendChild(dot);
    });
}

function openThread(name) {
    threadArea.classList.add("hidden");
    chatArea.classList.remove("hidden");
    messages.innerHTML = `<p>Chat with ${name}</p>`;
}

function sendMessage() {
    if (!chatInput.value.trim()) return;
    const bubble = document.createElement("div");
    bubble.textContent = chatInput.value;
    messages.appendChild(bubble);
    chatInput.value = "";
}

// ---------------------------
// THREAD DOT PHYSICS
// ---------------------------
function initPhysics() {
    threadNames.forEach(name => {
        velocities[name] = {
            vx: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1),
            vy: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1)
        };
    });
    requestAnimationFrame(updateDots);
}

function updateDots() {
    const dots = document.querySelectorAll(".thread-dot");
    const bounds = threadArea.getBoundingClientRect();
    dots.forEach(dot => {
        const name = threadNames[[...dots].indexOf(dot)];
        const pos = threadsData[name];
        const vel = velocities[name];
        pos.x += vel.vx;
        pos.y += vel.vy;
        if (pos.x <= 0 || pos.x >= bounds.width - 60) vel.vx *= -1;
        if (pos.y <= 0 || pos.y >= bounds.height - 60) vel.vy *= -1;
        dot.style.left = pos.x + "px";
        dot.style.top = pos.y + "px";
    });
    requestAnimationFrame(updateDots);
}

// ---------------------------
// POKEMON MODULE
// ---------------------------
let pokemonNames = [], fullPokemonData = [], filteredList = [];
let currentPokemonName = "", currentPokemonSprite = "";
const GEN_RANGES = {
    "Gen 1": [1,151], "Gen 2": [152,251], "Gen 3": [252,386],
    "Gen 4": [387,493], "Gen 5": [494,649], "Gen 6": [650,721],
    "Gen 7": [722,809], "Gen 8": [810,898], "Gen 9": [899,1025]
};

async function loadAllPokemonNames() {
    if (pokemonNames.length > 0) return;
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
    const data = await res.json();
    pokemonNames = data.results.map(p => p.name);
    fullPokemonData = data.results;
}

function openPokemon() {
    document.getElementById("pokemon-modal").classList.remove("hidden");
    loadAllPokemonNames().then(loadPokemon);
    const input = document.getElementById("pokemon-guess");
    input.addEventListener("input", spellingAssist);
}

function setGeneration(gen) {
    document.querySelectorAll('.gen-row button').forEach(btn => btn.classList.remove('active'));
    if (gen === 'all') {
        filteredList = fullPokemonData;
    } else {
        const [start,end] = GEN_RANGES[`Gen ${gen}`];
        filteredList = fullPokemonData.slice(start-1,end);
    }
    loadPokemon();
}

async function loadPokemon() {
    const pool = filteredList.length ? filteredList : fullPokemonData;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    const res = await fetch(choice.url);
    const data = await res.json();
    currentPokemonName = data.name;
    currentPokemonSprite = data.sprites.front_default;
    const img = document.getElementById("pokemon-silhouette");
    img.src = currentPokemonSprite;
    img.style.filter = "brightness(0)";
    document.getElementById("pokemon-feedback").textContent = "";
    document.getElementById("pokemon-guess").value = "";
    document.getElementById("pokemon-suggestions").style.display = "none";
}

function guessPokemon() {
    const guess = document.getElementById("pokemon-guess").value.trim().toLowerCase();
    if (!guess) return;
    const feedback = document.getElementById("pokemon-feedback");
    if (guess === currentPokemonName) {
        feedback.textContent = "🎉 Correct!";
        document.getElementById("pokemon-silhouette").style.filter = "none";
        setTimeout(loadPokemon, 1500);
    } else {
        feedback.textContent = "❌ Wrong. Try again!";
    }
}

function giveHint() {
    document.getElementById("pokemon-feedback").textContent = `Hint: Starts with "${currentPokemonName[0].toUpperCase()}"`;
}

function spellingAssist() {
    const q = document.getElementById("pokemon-guess").value.toLowerCase();
    const list = document.getElementById("pokemon-suggestions");
    if (!q) { list.style.display = "none"; return; }
    const matches = pokemonNames.filter(n => n.startsWith(q)).slice(0,12);
    list.innerHTML = "";
    matches.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        li.onclick = () => {
            document.getElementById("pokemon-guess").value = li.textContent;
            list.style.display = "none";
        };
        list.appendChild(li);
    });
    list.style.display = matches.length ? "block" : "none";
}

document.getElementById("pokemon-guess").addEventListener("input", spellingAssist);

// ---------------------------
// WORDLE MODULE
// ---------------------------
const WORD_LIST = ["APPLE","BANJO","CRANE","DANCE","ELITE","FLAME","GRAPE"];
function getWordOfTheDay() {
    const start = new Date("2025-01-01");
    const today = new Date();
    const diff = Math.floor((today-start)/(1000*60*60*24));
    return WORD_LIST[diff % WORD_LIST.length];
}

let WORD = getWordOfTheDay();
let guesses = [], currentGuess = "";

const boardEl = document.getElementById("game-board");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("game-message");

function initBoard() {
    boardEl.innerHTML = "";
    for(let i=0;i<30;i++){
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.appendChild(document.createElement("span"));
        boardEl.appendChild(tile);
    }
}

function initKeyboard() {
    keyboardEl.innerHTML = "";
    const keys = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];
    keys.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");
        if(row==="ZXCVBNM") addKey(rowDiv,"ENTER","wide");
        [...row].forEach(k => addKey(rowDiv,k));
        if(row==="ZXCVBNM") addKey(rowDiv,"⌫","wide");
        keyboardEl.appendChild(rowDiv);
    });
}

function addKey(rowDiv,char,wide="") {
    const key = document.createElement("div");
    key.classList.add("key");
    if(wide) key.classList.add(wide);
    key.textContent = char;
    key.onclick = () => handleKey(char);
    rowDiv.appendChild(key);
}

function handleKey(k){
    if(k==="⌫"){ currentGuess=currentGuess.slice(0,-1); updateBoard(); return; }
    if(k==="ENTER"){ submitGuess(); return; }
    if(currentGuess.length<5){ currentGuess+=k; updateBoard(); }
}

function updateBoard(){
    const tiles=[...document.querySelectorAll(".tile span")];
    for(let i=0;i<30;i++){
        let row=Math.floor(i/5);
        if(row<guesses.length) tiles[i].textContent=guesses[row][i%5];
        else if(row===guesses.length) tiles[i].textContent=currentGuess[i%5]||"";
        else tiles[i].textContent="";
    }
}

function submitGuess(){
    if(currentGuess.length<5){ messageEl.textContent="Not enough letters."; return; }
    guesses.push(currentGuess);
    revealGuess(currentGuess,guesses.length-1);
    currentGuess="";
    messageEl.textContent="";
}

function revealGuess(guess,row){
    const tiles=[...document.querySelectorAll(".tile")];
    const rowTiles=tiles.slice(row*5,row*5+5);
    [...guess].forEach((char,i)=>{
        setTimeout(()=>{
            rowTiles[i].classList.add("flip");
            if(WORD[i]===char) rowTiles[i].classList.add("correct");
            else if(WORD.includes(char)) rowTiles[i].classList.add("present");
            else rowTiles[i].classList.add("absent");
            rowTiles[i].querySelector("span").textContent=char;
            if(i===4) checkEndGame(guess);
        },i*300);
    });
}

function checkEndGame(guess){
    if(guess===WORD) messageEl.textContent="🎉 You got it!";
    else if(guesses.length===6) messageEl.textContent=`The word was: ${WORD}`;
}

function initGame(){
    guesses=[]; currentGuess="";
    WORD=getWordOfTheDay();
    initBoard();
    initKeyboard();
    updateBoard();
}

function openWordle(){
    document.getElementById("wordle-modal").classList.remove("hidden");
    initGame();
}

// ---------------------------
// CROSSWORD MODULE
// ---------------------------
const crosswordModal = document.getElementById("crossword-modal");
const crosswordGrid = document.getElementById("crossword-grid");
const crosswordClue = document.getElementById("crossword-clue");

let crosswordSize=15, crosswordCells=[], crosswordData=null, selectedCell=null, selectedDirection="across";

const DAILY_CROSSWORD = {
    size:15,
    grid:[
        "CAT..DOG.......",
        "..A..O........E",
        "RAT..GHOST.....",
        "....BIRD.......",
        "...TREE....FROG",
        "......PLANT....",
        "....COW........",
        "....PIG........",
        "....HORSE......",
        "SNAKE....BEAR..",
        ".....MOUSE.....",
        "....SHEEP......",
        "...GOAT........",
        "..DEER.........",
        "FOX............"
    ],
    clues:{
        across:{1:"Furry pet (3)",4:"Barks (3)",7:"Ghost sound (5)",12:"Tree dwelling singer (4)",14:"Green giant (4)"},
        down:{1:"Farm animal (3)",2:"Croaks (4)",3:"Forest animal (3)"}
    }
};

function openCrossword(){ crosswordModal.classList.remove("hidden"); loadDailyPuzzle(); }
function loadDailyPuzzle(){ crosswordData=DAILY_CROSSWORD; crosswordSize=crosswordData.size; drawGrid(); drawClueNumbers(); selectFirstCell(); setupKeyboard(); }

function drawGrid(){
    crosswordGrid.style.gridTemplateColumns=`repeat(${crosswordSize},1fr)`;
    crosswordGrid.innerHTML="";
    crosswordCells=[];
    for(let r=0;r<crosswordSize;r++){
        for(let c=0;c<crosswordSize;c++){
            const char=crosswordData.grid[r][c];
            const cell=document.createElement("div");
            cell.classList.add("cross-cell");
            cell.dataset.row=r; cell.dataset.col=c;
            if(char===".") cell.classList.add("black");
            cell.addEventListener("click",()=>selectCell(cell));
            crosswordGrid.appendChild(cell);
            crosswordCells.push(cell);
        }
    }
}

function drawClueNumbers(){
    crosswordCells.forEach(cell=>{
        if(cell.classList.contains("black")) return;
        const r=parseInt(cell.dataset.row), c=parseInt(cell.dataset.col);
        const startsAcross=c===0||getCell(r,c-1).classList.contains("black");
        const startsDown=r===0||getCell(r-1,c).classList.contains("black");
        if(startsAcross||startsDown){
            const number=getClueNumber(r,c);
            const numEl=document.createElement("div");
            numEl.classList.add("clue-number"); numEl.textContent=number;
            cell.appendChild(numEl);
        }
    });
}

function getClueNumber(r,c){ return r*crosswordSize+c+1; }
function getCell(r,c){ return crosswordCells[r*crosswordSize+c]; }

function selectCell(cell){
    crosswordCells.forEach(c=>c.classList.remove("selected","word-highlight"));
    cell.classList.add("selected"); selectedCell=cell;
    highlightWord(cell,selectedDirection);
    updateClueDisplay(cell);
}

function highlightWord(cell,direction){
    const r=parseInt(cell.dataset.row), c=parseInt(cell.dataset.col);
    let coords=[];
    if(direction==="across"){
        let cc=c; while(cc>=0&&!getCell(r,cc).classList.contains("black")) cc--; cc++;
        while(cc<crosswordSize&&!getCell(r,cc).classList.contains("black")) coords.push([r,cc++]);
    } else {
        let rr=r; while(rr>=0&&!getCell(rr,c).classList.contains("black")) rr--; rr++;
        while(rr<crosswordSize&&!getCell(rr,c).classList.contains("black")) coords.push([rr++,c]);
    }
    coords.forEach(([rr,cc])=>{
        const cell=getCell(rr,cc);
        if(!cell.classList.contains("selected")) cell.classList.add("word-highlight");
    });
}

function updateClueDisplay(cell){
    const number=cell.querySelector(".clue-number")?.textContent || "?";
    const clueObj=crosswordData.clues[selectedDirection];
    const clueText=clueObj[number] || "—";
    crosswordClue.innerHTML=`<span class="clue-direction">${selectedDirection.toUpperCase()}</span> <span class="clue-number">${number}.</span> <span class="clue-text">${clueText}</span>`;
}

function selectFirstCell(){ const cell=crosswordCells.find(c=>!c.classList.contains("black")); if(cell) selectCell(cell); }
function setupKeyboard(){
    document.querySelectorAll("#crossword-keyboard .ck-key").forEach(key=>{
        key.onclick=()=>{
            const value=key.dataset.key||key.textContent;
            if(!selectedCell||selectedCell.classList.contains("black")) return;
            if(value==="BACK") return backspaceCell();
            if(value==="NEXT") return moveToNextCell();
            fillCell(value);
        };
    });
}
function fillCell(letter){ selectedCell.textContent=letter; moveToNextCell(); }
function backspaceCell(){ if(selectedCell) selectedCell.textContent=""; }
function moveToNextCell(){
    if(!selectedCell) return;
    const r=parseInt(selectedCell.dataset.row), c=parseInt(selectedCell.dataset.col);
    let nr=r,nc=c;
    if(selectedDirection==="across") nc++; else nr++;
    const next=getCell(nr,nc);
    if(next&&!next.classList.contains("black")) selectCell(next);
}
