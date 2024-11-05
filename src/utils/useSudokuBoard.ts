// useSudokuBoard.ts
import { useState } from 'react';

interface Cell {
  value: number | "";
  isEditable: boolean;
  hasConflict: boolean;
}

export const useSudokuBoard = () => {
  const [board, setBoard] = useState<Cell[][]>(initializeBoard());

  const updateCell = (row: number, col: number, value: number | "") => {
    const newBoard = board.map((r, rowIndex) =>
      r.map((cell, colIndex) =>
        rowIndex === row && colIndex === col
          ? { ...cell, value, hasConflict: false }
          : cell
      )
    );
    setBoard(checkConflicts(newBoard));
  };

  const checkSolution = () => {
    return board.flat().every((cell) => cell.value !== "" && !cell.hasConflict);
  };

  return { board, updateCell, checkSolution };
};

function initializeBoard(): Cell[][] {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({
      value: "",
      isEditable: true,
      hasConflict: false,
    }))
  );
}

function checkConflicts(board: Cell[][]): Cell[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell, hasConflict: false })));

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = board[row][col];
      if (cell.value !== "") {
        if (
          hasRowConflict(board, row, col, cell.value) ||
          hasColConflict(board, row, col, cell.value) ||
          hasBoxConflict(board, row, col, cell.value)
        ) {
          newBoard[row][col].hasConflict = true;
        }
      }
    }
  }

  return newBoard;
}

function hasRowConflict(board: Cell[][], row: number, col: number, value: number) {
  return board[row].some((cell, idx) => idx !== col && cell.value === value);
}

function hasColConflict(board: Cell[][], row: number, col: number, value: number) {
  return board.some((r, idx) => idx !== row && r[col].value === value);
}

function hasBoxConflict(board: Cell[][], row: number, col: number, value: number) {
  const boxRowStart = Math.floor(row / 3) * 3;
  const boxColStart = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = board[boxRowStart + r][boxColStart + c];
      if ((boxRowStart + r !== row || boxColStart + c !== col) && cell.value === value) {
        return true;
      }
    }
  }
  return false;
}
