// SudokuBoard.tsx
import React from 'react';
import './SudokuBoard.css';
import { useSudokuBoard } from '../../utils/useSudokuBoard';

const SudokuBoard: React.FC = () => {
  const { board, updateCell, checkSolution } = useSudokuBoard();

  const handleChange = (row: number, col: number, value: string) => {
    if (/^[1-9]?$/.test(value)) {  // Accept only numbers 1-9 or empty
      updateCell(row, col, value === "" ? "" : parseInt(value, 10));
    }
  };

  const handleCheckSolution = () => {
    if (checkSolution()) {
      alert("Congratulations! The solution is correct.");
    } else {
      alert("The solution is incorrect. Please try again.");
    }
  };

  return (
    <div>
      <div className="sudoku-board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="text"
              maxLength={1}
              value={cell.value || ""}
              onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
              className={`sudoku-cell ${cell.isEditable ? "editable" : ""} ${cell.hasConflict ? "conflict" : ""}`}
            />
          ))
        )}
      </div>
      <button onClick={handleCheckSolution} className="check-solution-button">Check Solution</button>
    </div>
  );
};

export default SudokuBoard;
