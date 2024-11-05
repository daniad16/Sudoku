// SudokuBoard.tsx
import React from 'react';
import './SudokuBoard.css';
import { useSudokuBoard } from '../utils/useSudokuBoard';


const SudokuBoard: React.FC = () => {
  const { board, updateCell } = useSudokuBoard();

  const handleChange = (row: number, col: number, value: string) => {
    if (!/^[1-9]?$/.test(value)) return;
    updateCell(row, col, value === "" ? "" : parseInt(value, 10));
  };

  return (
    <div className="sudoku-board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <input
            key={`${rowIndex}-${colIndex}`}
            type="text"
            maxLength={1}
            value={cell.value}
            onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
            className={`sudoku-cell ${cell.isEditable ? "editable" : ""}`}
          />
        ))
      )}
    </div>
  );
};

export default SudokuBoard;
