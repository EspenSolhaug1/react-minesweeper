import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [mines] = useState<number>(10);
  const [clearCellsRemaining, setClearCellsRemaining] = useState<number>(
    100 - mines
  );
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [win, setWin] = useState<boolean>(false);
  const [minefield, setMinefield] = useState<Cell[][]>(
    Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => ({
        isMine: false,
        value: 0,
        isRevealed: false,
        isFlag: false,
      }))
    )
  );

  useEffect(() => {
    generateMines(minefield, mines);
  }, []);

  function generateMines(minefield: Cell[][], mines: number) {
    const copiedBoard: Cell[][] = minefield.map((row) =>
      row.map((cell) => ({ ...cell }))
    );
    let minesPlaced = 0;

    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);

      if (!copiedBoard[row][col].isMine) {
        copiedBoard[row][col].isMine = true;
        minesPlaced++;

        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (x === 0 && y === 0) continue;
            const newRow = row + x;
            const newCol = col + y;

            if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
              copiedBoard[newRow][newCol].value++;
            }
          }
        }
      }
    }
    setMinefield(copiedBoard);
  }

  function onclick(x: number, y: number) {
    if (gameOver || minefield[x][y].isRevealed || minefield[x][y].isFlag)
      return;

    let newBoard = minefield.map((row) => row.map((cell) => ({ ...cell })));

    if (newBoard[x][y].isMine) {
      setGameOver(true);
      return;
    }

    if (newBoard[x][y].value === 0) {
      newBoard = clearCellsRecursion(newBoard, x, y);
    } else {
      newBoard[x][y].isRevealed = true;
    }

    const revealedCount = newBoard
      .flat()
      .filter((cell) => cell.isRevealed).length;
    setClearCellsRemaining(100 - mines - revealedCount);

    if (100 - mines - revealedCount === 0) {
      setWin(true);
    }

    setMinefield(newBoard);
  }

  function clearCellsRecursion(
    board: Cell[][],
    startX: number,
    startY: number
  ) {
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

    function revealCells(x: number, y: number) {
      if (x < 0 || x >= 10 || y < 0 || y >= 10) return;

      if (newBoard[x][y].isRevealed || newBoard[x][y].isFlag) return;

      newBoard[x][y].isRevealed = true;

      if (newBoard[x][y].value === 0) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx !== 0 || dy !== 0) {
              revealCells(x + dx, y + dy);
            }
          }
        }
      }
    }

    revealCells(startX, startY);
    return newBoard;
  }

  function onRightClick(e: React.MouseEvent, x: number, y: number) {
    e.preventDefault();
    if (gameOver || minefield[x][y].isRevealed) return;
    const newBoard = [...minefield];
    newBoard[x][y].isFlag = !newBoard[x][y].isFlag;
    setMinefield(newBoard);
  }

  return (
    <>
      <h1>React Minesweeper</h1>
      <div className="container">
        {minefield.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell: Cell, cellIndex) => (
              <div
                className="cell"
                key={cellIndex}
                style={
                  cell.isRevealed
                    ? { background: "grey" }
                    : { background: "darkgrey" }
                }
                onClick={
                  !gameOver || !win
                    ? () => onclick(rowIndex, cellIndex)
                    : undefined
                }
                onContextMenu={(e) => onRightClick(e, rowIndex, cellIndex)}
              >
                {cell.isRevealed
                  ? cell.isMine
                    ? "💣"
                    : cell.value == 0
                    ? ""
                    : cell.value
                  : cell.isFlag
                  ? "🚩"
                  : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
      {win && <div>YOU WON</div>}
      {gameOver && <div>YOU LOST</div>}
    </>
  );
}

export default App;
