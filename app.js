const gameBoard = (() => {
  const board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];

  const setCell = (row, col, value) => {
    board[row][col] = value;
  };

  const getCell = (row, col) => board[row][col];

  const restart = () => {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        board[row][col] = '';
      }
    }
  };

  return {
    setCell,
    getCell,
    restart,
  };
})();

const player = (symbol) => ({ symbol });

const displayController = (() => {
  const cells = document.querySelectorAll('.cell');

  const addCellClickListener = (listener) => {
    cells.forEach((cell) => {
      cell.addEventListener('click', listener);
    });
  };

  const updateCellDisplay = (index, symbol) => {
    const span = document.createElement('span');

    cells[index].appendChild(span);
    span.textContent = symbol;
  };

  const resetClick = () => {
    cells.forEach((cell) => {
      cell.clicked = false;
    });
  };

  const removeCellChild = () => {
    cells.forEach((cell) => {
      if (cell.firstChild) {
        cell.removeChild(cell.firstChild);
      }
    });
  };

  return {
    addCellClickListener,
    updateCellDisplay,
    cells,
    resetClick,
    removeCellChild,
  };
})();

const displayName = (() => {
  const updateLog = (playerLogSelector, symbol) => {
    const playerLog = document.querySelector(playerLogSelector);
    const name = playerLog.querySelector('h3');
    const input = playerLog.querySelector('input');
    const edit = playerLog.querySelector('.edit');
    const done = playerLog.querySelector('.done');
    const score = playerLog.querySelector('.score');

    edit.addEventListener('click', () => {
      name.style.visibility = 'hidden';
      input.style.display = 'block';
      done.style.display = 'block';
      edit.style.display = 'none';
    });

    done.addEventListener('click', () => {
      name.textContent = `${input.value} (${symbol})`;
      input.style.display = 'none';
      done.style.display = 'none';
      name.style.visibility = 'visible';
      edit.style.display = 'block';
    });
  };

  updateLog('.playerX', 'X');
  updateLog('.playerO', 'O');
})();

const gameLogic = (() => {
  const checkWinner = (row, col) => {
    const symbol = gameBoard.getCell(row, col);

    // check row
    if (
      gameBoard.getCell(row, 0) === symbol &&
      gameBoard.getCell(row, 1) === symbol &&
      gameBoard.getCell(row, 2) === symbol
    ) {
      return true;
    }

    // check column
    if (
      gameBoard.getCell(0, col) === symbol &&
      gameBoard.getCell(1, col) === symbol &&
      gameBoard.getCell(2, col) === symbol
    ) {
      return true;
    }

    // check diagonal
    if (
      row === col &&
      gameBoard.getCell(0, 0) === symbol &&
      gameBoard.getCell(1, 1) === symbol &&
      gameBoard.getCell(2, 2) === symbol
    ) {
      return true;
    }

    if (
      row + col === 2 &&
      gameBoard.getCell(0, 2) === symbol &&
      gameBoard.getCell(1, 1) === symbol &&
      gameBoard.getCell(2, 0) === symbol
    ) {
      return true;
    }
    return false;
  };

  return {
    checkWinner,
  };
})();

const gameController = (() => {
  const playerX = player('X');
  const playerO = player('O');
  let currentPlayer = playerX;
  let moveCount = 0;
  let isGameOver = false;
  let gameRound = 0;
  let xScore = 0;
  let oScore = 0;
  let tieScore = 0;
  const playerXScore = document.querySelector('.playerX .score');
  const playerOScore = document.querySelector('.playerO .score');
  const tie = document.querySelector('.tieScore');
  const cells = document.querySelector('.cells');
  const winnerAnnounce = document.querySelector('.resultAnnounce');
  const playerXName = document.querySelector('.playerX h3');
  const playerOName = document.querySelector('.playerO h3');

  const handleClick = (e) => {
    const cell = e.target;

    const index = Array.from(displayController.cells).findIndex(
      (child) => child === cell
    );

    const row = Math.floor(index / 3);
    const col = index % 3;

    if (gameBoard.getCell(row, col) === '' && !isGameOver && !cell.clicked) {
      gameBoard.setCell(row, col, currentPlayer.symbol);
      displayController.updateCellDisplay(index, currentPlayer.symbol);
      cell.clicked = true;

      if (gameLogic.checkWinner(row, col)) {
        setTimeout(() => handleWin(currentPlayer), 1000);
      } else {
        moveCount += 1;
        if (moveCount === 9) {
          handleWin(null);
        } else {
          currentPlayer = currentPlayer === playerX ? playerO : playerX;
          showPlayerTurn();
        }
      }
    }
  };

  const showPlayerTurn = () => {
    if (currentPlayer === playerX) {
      playerXName.classList.add('turn');
      playerOName.classList.remove('turn');
    } else if (currentPlayer === playerO) {
      playerOName.classList.add('turn');
      playerXName.classList.remove('turn');
    }
  };

  const updateAllScores = () => {
    tie.textContent = `Score: ${tieScore} / ${gameRound}`;
    playerXScore.textContent = `Score: ${xScore} / ${gameRound}`;
    playerOScore.textContent = `Score: ${oScore} / ${gameRound}`;
  };

  const handleWin = (winningPlayer) => {
    isGameOver = true;
    gameRound += 1;
    moveCount = 0;

    cells.classList.add('none');
    winnerAnnounce.classList.remove('hide');

    const winnerSymbol = document.querySelector(
      '.resultAnnounce p .spanSymbol'
    );
    const symbolText = document.querySelector('.resultAnnounce p .spanText');
    const winnerName = document.querySelector('.resultAnnounce p:last-of-type');
    const playAgain = document.querySelector('.resultAnnounce .playAgain');

    let playerName;

    if (winningPlayer === null) {
      tieScore += 1;
      updateAllScores();
      winnerSymbol.textContent = 'X O';
      symbolText.textContent = '';
      winnerName.textContent = `It's a Draw!`;
    } else if (winningPlayer.symbol === 'X') {
      xScore += 1;
      updateAllScores();
      winnerSymbol.textContent = 'X';
      symbolText.textContent = 'triumphs!';
      playerName = playerXName.textContent.slice(0, -4);
      winnerName.textContent = `Well done, ${playerName}!`;
    } else if (winningPlayer.symbol === 'O') {
      oScore += 1;
      updateAllScores();
      winnerSymbol.textContent = 'O';
      symbolText.textContent = 'triumphs!';
      playerName = playerOName.textContent.slice(0, -4);
      winnerName.textContent = `Well done, ${playerName}!`;
    }

    playAgain.addEventListener('click', () => {
      winnerAnnounce.classList.add('hide');
      cells.classList.remove('none');
      gameBoard.restart();
      currentPlayer = playerX;
      isGameOver = false;
      displayController.removeCellChild();
      displayController.resetClick();
      showPlayerTurn();
    });
  };

  const resetGame = (() => {
    const reset = document.querySelector('.reset');
    reset.addEventListener('click', () => {
      xScore = 0;
      oScore = 0;
      tieScore = 0;
      gameRound = 0;
      currentPlayer = playerX;
      isGameOver = false;
      updateAllScores();
      showPlayerTurn();
      gameBoard.restart();
      displayController.removeCellChild();
      displayController.resetClick();
      if (cells.classList.contains('none')) {
        winnerAnnounce.classList.add('hide');
        cells.classList.remove('none');
      }
    });
  })();

  displayController.addCellClickListener(handleClick);
})();
