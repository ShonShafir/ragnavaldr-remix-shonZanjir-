const board = [];

const colors = {
  Flag: "crimson",
  Cell: "dimgray",
  Mine: "black",
  Checked: "white",
};

const mode = {
  easy: {
    key: "easy",
    shape: 9,
    cellSize: 4,
    mines: 10,
  },
  hard: {
    key: "hard",
    shape: 16,
    cellSize: 3,
    mines: 40,
  },
  extreme: {
    key: "extreme",
    shape: 25,
    cellSize: 2.5,
    mines: 100,
  },
};

const CELL = "cell";
const MINE = "Mine";
const POPUPTYPES = {
  win: "popup win",
  lose: "popup lose",
};

const POPUP = "POPUP";
const BOARD_ELEMENT = "board";

let isFirstClick = true;
let boardToShuffle = [];
let boardElement = [];
let amount_of_mines;

function shuffle(array, row, col) {
  let counter = 0;
  for (let r=0;r<array.length;r++){
    array[r].pos = counter
    counter = counter+1
  }

  let tempArr = array.filter(item => item.row !== row || item.col !== col);
  
  while (amount_of_mines > 0) {
    let randomIndex = Math.floor(Math.random() * tempArr.length);
    let mineCell = tempArr[randomIndex];
    
    let posPlace = mineCell.pos;
    const size = Math.sqrt(array.length);
    const rowToPlace = Math.floor(posPlace / size);
    const colToPlace = posPlace % size;
    
    //array[posPlace] = makeMine();
    board[rowToPlace][colToPlace] = makeMine();
    tempArr.splice(randomIndex, 1);
    amount_of_mines--;
  }
}


function getDifficulty() {
  var radios = document.getElementsByName("difficulty");

  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
}

function reveal(element) {
  if (element.style.background === colors.Checked) return;
  const row = parseInt(element.row);
  const col = parseInt(element.col);
  const mines = parseInt(element.mines);

  element.style.background = colors.Checked;
  if (mines > 0) {
    element.textContent = mines;
    return;
  }

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const rowToCheck = row + i;
      const colToCheck = col + j;

      if (isValidCell(rowToCheck, colToCheck)) {
        reveal(board[rowToCheck][colToCheck]);
      } 
    }
  }
}

function checkWin() {
  let difficultyInfo = mode.easy;
  difficultyInfo = mode[getDifficulty()];
  let revealed = 0;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      if (board[row][col].style.background === colors.Checked) revealed++;
    }
  }
  return revealed === board.length ** 2 - difficultyInfo.mines;
}

function clickHandler(e) {
  //debugger;
  const element = e.target;
  if (
    element.style.background === colors.Flag ||
    document.getElementById(POPUP) != null
  )
    return;

  const row = parseInt(element.row);
  const col = parseInt(element.col);
  

  if (isFirstClick) {
    shuffle(boardToShuffle,row,col);
    isFirstClick = false;

    const difficulty = getDifficulty();
    let difficultyInfo = mode.easy;
    difficultyInfo = mode[difficulty];

    for (let row = 0; row < difficultyInfo.shape; row++) {
      for (let col = 0; col < difficultyInfo.shape; col++) {
        board[row][col].mines = calculateAdjoined(row, col);
      }
    }
  }

  if (board[row][col].isMine === MINE) {
    element.style.background = colors.Mine;

    const popupElement = document.createElement("div");
    popupElement.className = POPUPTYPES.lose;
    popupElement.id = POPUP;
    popupElement.textContent = "You Lost FML";

    document.body.appendChild(popupElement);
    isFirstClick = true;
    return;
  }

  reveal(element);

  if (checkWin()) {
    const popupElement = document.createElement("div");
    popupElement.className = POPUPTYPES.win;
    popupElement.id = POPUP;
    popupElement.textContent = "You WON FML!!!!!!";
    document.body.appendChild(popupElement);
    isFirstClick = true;
  }
}

function onRightClick(e) {
  const element = e.target;
  if (
    element.style.background !== colors.Checked &&
    element.style.background !== colors.Mine
  )
    element.style.background =
      element.style.background === colors.Flag ? colors.Cell : colors.Flag;
}

function makeCell() {
  const cell = document.createElement("div");
  cell.onclick = clickHandler;
  cell.style.background = colors.Cell;
  cell.oncontextmenu = onRightClick;
  cell.className = "cell";
  cell.isMine = false; // Initialize as not a mine
  return cell;
}

function makeMine() {
  const cell = document.createElement("div");
  cell.onclick = clickHandler;
  cell.oncontextmenu = onRightClick;
  cell.className = "cell";
  cell.style.background = colors.Cell;
  cell.isMine = MINE;

  return cell;
}

function isValidCell(row, col) {
  if (row < 0 || col < 0) return false;
  if (row >= board.length || col >= board.length) return false;
  return true;
}

function calculateAdjoined(row, col) {
  let mines = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const rowToCheck = row + i;
      const colToCheck = col + j;
      
      if (
        isValidCell(rowToCheck, colToCheck) &&
        board[rowToCheck][colToCheck].isMine === MINE
        //boardToShuffle.filter(item => item.row===rowToCheck && item.col===colToCheck).isMine === MINE
      )
        mines++;
    }
  }

  return mines;
}

function generateBoard() {
  isFirstClick = true
  boardToShuffle = [];
  const boardElement = document.getElementById(BOARD_ELEMENT);
  document.getElementById(POPUP)?.remove();

  const difficulty = getDifficulty();
  let difficultyInfo = mode.easy;
  difficultyInfo = mode[difficulty];

  const size = `${difficultyInfo.cellSize * difficultyInfo.shape}rem`;
  boardElement.style.width = size;
  boardElement.style.height = size;
  boardElement.style.gridTemplateColumns = `repeat(${difficultyInfo.shape}, 1fr)`;
  boardElement.style.gridTemplateRows = `repeat(${difficultyInfo.shape}, 1fr)`;

  boardElement.innerHTML = "";
  board.length = 0;

  amount_of_mines = difficultyInfo.mines
  
  for (let i = 0; i < difficultyInfo.shape ** 2; i++) {
    let cell = makeCell();
    boardToShuffle.push(cell);
  }

  boardToShuffle.forEach((x) => boardElement.appendChild(x));
  for (let row = 0; row < difficultyInfo.shape; row++) {
    const rowToAdd = [];
    for (let col = 0; col < difficultyInfo.shape; col++) {
      const index = row * difficultyInfo.shape + col;
      boardToShuffle[index].row = row;
      boardToShuffle[index].col = col;
      rowToAdd.push(boardToShuffle[index]);
    }
    board.push(rowToAdd);
  }
}

window.addEventListener("contextmenu", (e) => e.preventDefault());
