const GRID_SIZE = 15;
let crosswordData = {
    grid: [
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
    clues: {
        across: {
            1: "Furry pet (3)",
            4: "Barks (3)",
            7: "Ghost sound (5)",
            12: "Tree dwelling singer (4)",
            14: "Green giant (4)"
        },
        down: {
            1: "Farm animal (3)",
            2: "Croaks (4)",
            3: "Forest animal (3)"
        }
    }
};

let crosswordCells = [];
let selectedCell = null;
let selectedDirection = "across";

function initCrossword() {
    const gridEl = document.getElementById("crossword-grid");
    gridEl.innerHTML = "";
    crosswordCells = [];

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const char = crosswordData.grid[r][c];
            const cell = document.createElement("div");
            cell.classList.add("cross-cell");
            if (char === ".") cell.classList.add("black");

            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.dataset.char = char;

const clueNum = getClueNumber(r, c);
            if (clueNum) {
                const numEl = document.createElement("div");
                numEl.classList.add("clue-number");
                numEl.textContent = clueNum;
                cell.appendChild(numEl);
            }

            cell.addEventListener("click", () => selectCell(cell));
            gridEl.appendChild(cell);
            crosswordCells.push(cell);
        }
    }

    initKeyboard();
    renderClues();
}

function getClueNumber(r, c) {
    // Simple numbering: first cell of a word
    const startsAcross = c === 0 || crosswordData.grid[r][c-1] === ".";
    const startsDown = r === 0 || crosswordData.grid[r-1][c] === ".";
    if (startsAcross || startsDown) return r * GRID_SIZE + c + 1;
    return null;
}

function selectCell(cell) {
    crosswordCells.forEach(c => c.classList.remove("selected","word-highlight"));
    cell.classList.add("selected");
    selectedCell = cell;
    highlightWord(cell, selectedDirection);
}

function highlightWord(cell, direction) {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    let coords = [];

    if (direction === "across") {
        let cc = c; while(cc>=0 && crosswordData.grid[r][cc] !== ".") cc--; cc++;
        while(cc<GRID_SIZE && crosswordData.grid[r][cc] !== ".") { coords.push([r,cc]); cc++; }
    } else {
        let rr = r; while(rr>=0 && crosswordData.grid[rr][c] !== ".") rr--; rr++;
        while(rr<GRID_SIZE && crosswordData.grid[rr][c] !== ".") { coords.push([rr,c]); rr++; }
    }

    coords.forEach(([rr,cc]) => {
        const cell = getCell(rr,cc);
        if(!cell.classList.contains("selected")) cell.classList.add("word-highlight");
    });
}

function getCell(r,c) {
    return crosswordCells[r*GRID_SIZE + c];
}

function initKeyboard() {
    const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
    const kb = document.getElementById("crossword-keyboard");
    kb.innerHTML = "";
    keys.forEach(k=>{
        const key = document.createElement("div");
        key.classList.add("ck-key");
        key.textContent = k;
        key.onclick = ()=>fillCell(k);
        kb.appendChild(key);
    });
    // Backspace
    const back = document.createElement("div");
    back.classList.add("ck-key","wide");
    back.textContent = "⌫";
    back.onclick = backspaceCell;
    kb.appendChild(back);
}

function fillCell(letter) {
    if(!selectedCell || selectedCell.classList.contains("black")) return;
    selectedCell.textContent = letter;
    moveNext();
}

function backspaceCell() {
    if(!selectedCell || selectedCell.classList.contains("black")) return;
    selectedCell.textContent = "";
}

function moveNext() {
    if(!selectedCell) return;
    let r = parseInt(selectedCell.dataset.row);
    let c = parseInt(selectedCell.dataset.col);
    if(selectedDirection==="across") c++; else r++;
    const next = getCell(r,c);
    if(next && !next.classList.contains("black")) selectCell(next);
}

function renderClues() {
    const ac = document.getElementById("clues-across");
    const dn = document.getElementById("clues-down");
    ac.innerHTML = "";
    dn.innerHTML = "";
    for(let n in crosswordData.clues.across) {
        const p = document.createElement("p");
        p.textContent = `${n}. ${crosswordData.clues.across[n]}`;
        ac.appendChild(p);
    }
    for(let n in crosswordData.clues.down) {
        const p = document.createElement("p");
        p.textContent = `${n}. ${crosswordData.clues.down[n]}`;
        dn.appendChild(p);
    }
}

document.getElementById("back-btn").onclick = initCrossword;

window.onload = initCrossword;
