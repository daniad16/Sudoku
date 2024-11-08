import { useEffect, useState } from "react";
import './SudokuBoard.css'

const GRID_SIZE = 9;
type CellValue = number | null;

const initialGrid: CellValue[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const SudokuBoard = () => {
    const [grid, setGrid] = useState<CellValue[][]>(initialGrid);
    const [conflicts, setConflicts] = useState<boolean[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false)));
    const [difficulty, setDifficulty] = useState<string>('easy');

    useEffect(() => {
        generatePuzzle();
    }, [difficulty]);

    const handleChange = (row: number, col: number, value: string) => {
        const num = value ? parseInt(value) : null;
        const newGrid = [...grid];
        newGrid[row][col] = num;
        setGrid(newGrid);
        checkConflicts(newGrid);
    };

    const checkConflicts = (newGrid: CellValue[][]) => {
        const newConflicts = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));

        for (let i = 0; i < GRID_SIZE; i++) {
            const rowValues = new Set<number>();
            const colValues = new Set<number>();
            for (let j = 0; j < GRID_SIZE; j++) {
                if (newGrid[i][j]) {
                    if (rowValues.has(newGrid[i][j] as number)) {
                        newConflicts[i][j] = true;
                    }
                    rowValues.add(newGrid[i][j] as number);
                }
                if (newGrid[j][i]) {
                    if (colValues.has(newGrid[j][i] as number)) {
                        newConflicts[j][i] = true;
                    }
                    colValues.add(newGrid[j][i] as number);
                }
            }
        }

        for (let startRow = 0; startRow < GRID_SIZE; startRow += 3) {
            for (let startCol = 0; startCol < GRID_SIZE; startCol += 3) {
                const gridValues = new Set<number>();
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const cellValue = newGrid[startRow + i][startCol + j];
                        if (cellValue) {
                            if (gridValues.has(cellValue)) {
                                newConflicts[startRow + i][startCol + j] = true;
                            }
                            gridValues.add(cellValue);
                        }
                    }
                }
            }
        }

        setConflicts(newConflicts);
    };

    const checkSolution = () => {
        for (let i = 0; i < GRID_SIZE; i++) {
            const rowValues = new Set<number>();
            const colValues = new Set<number>();
    
            for (let j = 0; j < GRID_SIZE; j++) {
                if (grid[i][j] === null || rowValues.has(grid[i][j] as number)) {
                    alert("The solution is incorrect.");
                    return false;
                }
                rowValues.add(grid[i][j] as number);
    
                if (grid[j][i] === null || colValues.has(grid[j][i] as number)) {
                    alert("The solution is incorrect.");
                    return false;
                }
                colValues.add(grid[j][i] as number);
            }
        }
    
        for (let startRow = 0; startRow < GRID_SIZE; startRow += 3) {
            for (let startCol = 0; startCol < GRID_SIZE; startCol += 3) {
                const gridValues = new Set<number>();
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const cellValue = grid[startRow + i][startCol + j];
                        if (cellValue === null || gridValues.has(cellValue)) {
                            alert("The solution is incorrect.");
                            return false;
                        }
                        gridValues.add(cellValue);
                    }
                }
            }
        }
    
        alert("The solution is correct!");
        return true;
    };
    

    const getMinFilledCells = (difficulty: string): number => {
        switch (difficulty) {
            case 'easy':
                return 40;
            case 'medium':
                return 30;
            case 'hard':
                return 20;
            default:
                return 30;
        }
    };

    const generatePuzzle = () => {
        const filledGrid = JSON.parse(JSON.stringify(initialGrid));
        solveSudoku(filledGrid);
        const minFilledCells = getMinFilledCells(difficulty);

        const newPuzzle = removeCells(filledGrid, 81 - minFilledCells);
        setGrid(newPuzzle);
    };

    const removeCells = (grid: CellValue[][], cellsToRemove: number): CellValue[][] => {
        const gridCopy = JSON.parse(JSON.stringify(grid));

        let removedCells = 0;
        while (removedCells < cellsToRemove) {
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);

            if (gridCopy[row][col] !== null) {
                gridCopy[row][col] = null;
                removedCells++;
            }
        }

        return gridCopy;
    };

    const isSafe = (grid: CellValue[][], row: number, col: number, num: number): boolean => {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[row][x] === num || grid[x][col] === num) {
                return false;
            }
        }

        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }
        return true;
    };

    const solveSudoku = (grid: CellValue[][]): boolean => {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (grid[row][col] === null) {
                    for (let num = 1; num <= 9; num++) {
                        if (isSafe(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (solveSudoku(grid)) {
                                return true;
                            }
                            grid[row][col] = null;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    };

    const handleSolve = () => {
        const newGrid = [...grid];
        if (solveSudoku(newGrid)) {
            setGrid(newGrid);
        } else {
            alert('No solution found!');
        }
    };

    const handleHint = () => {
        const emptyCells: { row: number; col: number }[] = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (grid[row][col] === null) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            for (let num = 1; num <= 9; num++) {
                if (isSafe(grid, row, col, num)) {
                    const newGrid = [...grid];
                    newGrid[row][col] = num;
                    setGrid(newGrid);
                    return;
                }
            }
        } else {
            alert('No empty cells to provide a hint!');
        }
    };


    return (
        <div>
            <h1>Sudoku Game</h1>
            <div className="diff">
                <label>Select Difficulty: </label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>

            <div className="board">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {row.map((cell, colIndex) => (
                            <input
                                key={colIndex}
                                type="text"
                                maxLength={1}
                                value={cell || ''}
                                onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                                className={`cell ${conflicts[rowIndex][colIndex] ? 'conflict' : ''}`}
                                disabled={cell !== null} 
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="buttons-container">
                <button onClick={handleSolve} className="button">Solve</button>
                <button onClick={checkSolution} className="button">Check Solution</button>
                <button onClick={handleHint} className="button">Hint</button>
                <button onClick={generatePuzzle} className="button">Generate New Puzzle</button>
            </div>

        </div>
    )

};

export default SudokuBoard;

