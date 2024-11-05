// useSudokuBoard.ts
import { useState } from 'react';
import { Board, Cell } from './types';

const createEmptyBoard = (): Board => {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({ value: "", isEditable: true }))
  );
};

export const useSudokuBoard = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());

  const updateCell = (row: number, col: number, value: number | "") => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(r => r.map(c => ({ ...c })));
      newBoard[row][col].value = value;
      return newBoard;
    });
  };

  return {
    board,
    updateCell,
  };
};
