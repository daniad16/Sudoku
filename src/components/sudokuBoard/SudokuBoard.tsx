import { useEffect, useState } from "react";
import { recognizeSudokuFromImage} from "../../utils/OCRHandler";
import './SudokuBoard.css';

const GRID_SIZE = 9;
type CellValue = number | null;

const initialGrid: CellValue[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

const SudokuBoard = () => {
    const [grid, setGrid] = useState<CellValue[][]>(initialGrid);
    const [conflicts, setConflicts] = useState<boolean[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false)));
    const [difficulty, setDifficulty] = useState<string>('easy');
    const [loading, setLoading] = useState(false);
    const [ocrError, setOcrError] = useState<string | null>(null);

    useEffect(() => {
        generatePuzzle();
    }, [difficulty]);

    //نستخدم مجموعتين Set هما rowValues وcolValues لتخزين القيم في الصف الحالي والعمود الحالي.
    const checkRowConflicts = (grid:CellValue[][], newConflicts:boolean[][]) => {
        for (let i = 0; i < GRID_SIZE; i++) {
            const rowValues = new Set<number>();
            for (let j = 0; j < GRID_SIZE; j++) {
                const value = grid[i][j];
                if (value) {
                    if (rowValues.has(value)) newConflicts[i][j] = true;
                    rowValues.add(value);
                }
            }
        }
    };
    
    const checkColConflicts = (grid : CellValue[][], newConflicts:boolean[][]) => {
        for (let i = 0; i < GRID_SIZE; i++) {
            const colValues = new Set<number>();
            for (let j = 0; j < GRID_SIZE; j++) {
                const value = grid[j][i];
                if (value) {
                    if (colValues.has(value)) newConflicts[j][i] = true;
                    colValues.add(value);
                }
            }
        }
    };
    
    const checkBoxConflicts = (grid : CellValue[][], newConflicts:boolean[][]) => {
        for (let startRow = 0; startRow < GRID_SIZE; startRow += 3) {
            for (let startCol = 0; startCol < GRID_SIZE; startCol += 3) {
                const gridValues = new Set<number>();
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const value = grid[startRow + i][startCol + j];
                        if (value) {
                            if (gridValues.has(value)) newConflicts[startRow + i][startCol + j] = true;
                            gridValues.add(value);
                        }
                    }
                }
            }
        }
    };
    
    const checkConflicts = (newGrid: CellValue[][]) => {
        const newConflicts = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
        checkRowConflicts(newGrid, newConflicts);
        checkColConflicts(newGrid, newConflicts);
        checkBoxConflicts(newGrid, newConflicts);
        setConflicts(newConflicts);
    };

    const handleChange = (row: number, col: number, value: string) => {
        const num = value ? parseInt(value) : null;
        const newGrid = [...grid];
        newGrid[row][col] = num;
        setGrid(newGrid);
        checkConflicts(newGrid);
    };

    
    

    const checkSolution = () => {
        const isRowColValid = () => {
            for (let i = 0; i < GRID_SIZE; i++) {
                const rowValues = new Set<number>();
                const colValues = new Set<number>();
    
                for (let j = 0; j < GRID_SIZE; j++) {
                    const rowValue = grid[i][j];
                    const colValue = grid[j][i];
    
                    if (rowValue === null || rowValues.has(rowValue)) {
                        return { valid: false, message: "Duplicate or missing number in row " + (i + 1) };
                    }
                    rowValues.add(rowValue);
    
                    if (colValue === null || colValues.has(colValue)) {
                        return { valid: false, message: "Duplicate or missing number in column " + (i + 1) };
                    }
                    colValues.add(colValue);
                }
            }
            return { valid: true };
        };
    
        const isBoxValid = () => {
            for (let startRow = 0; startRow < GRID_SIZE; startRow += 3) {
                for (let startCol = 0; startCol < GRID_SIZE; startCol += 3) {
                    const gridValues = new Set<number>();
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            const cellValue = grid[startRow + i][startCol + j];
                            if (cellValue === null || gridValues.has(cellValue)) {
                                return { valid: false, message: "Duplicate or missing number in 3x3 box starting at row " + (startRow + 1) + ", col " + (startCol + 1) };
                            }
                            gridValues.add(cellValue);
                        }
                    }
                }
            }
            return { valid: true };
        };
    
        const rowColCheck = isRowColValid();
        if (!rowColCheck.valid) {
            alert(rowColCheck.message);
            return false;
        }
    
        const boxCheck = isBoxValid();
        if (!boxCheck.valid) {
            alert(boxCheck.message);
            return false;
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
        const filledGrid = structuredClone(initialGrid); // طريقة أسهل لعمل نسخة عميقة
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
        // التحقق من وجود الرقم في الصف أو العمود
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[row][x] === num || grid[x][col] === num) return false;
        }
    
        // حساب بداية المربع الفرعي 3x3
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
    
        // التحقق من وجود الرقم في المربع الفرعي 3x3
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[startRow + i][startCol + j] === num) return false;
            }
        }
    
        return true;
    };
    

    const solveSudoku = (grid: CellValue[][]): boolean => {
        // البحث عن الخلية الفارغة
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (grid[row][col] === null) {
                    
                    // تجربة الأرقام من 1 إلى 9
                    for (let num = 1; num <= 9; num++) {
                        if (isSafe(grid, row, col, num)) {
                            grid[row][col] = num; // وضع الرقم
                            
                            if (solveSudoku(grid)) return true; // محاولة الحل المتبقية
                            
                            grid[row][col] = null; // التراجع إذا لم يُعثر على حل
                        }
                    }
                    
                    return false; // إرجاع `false` إذا لم ينجح أي رقم
                }
            }
        }
        
        return true; // إرجاع `true` إذا تم الحل بشكل صحيح
    };
    

    const handleSolve = () => {
         // إنشاء نسخة عميقة من الشبكة لضمان عدم التلاعب بالشبكة الأصلية
         // const newGrid = JSON.parse(JSON.stringify(grid));
        const newGrid = [...grid];
        if (solveSudoku(newGrid)) {
            setGrid(newGrid);
        } else {
            alert('No valid solution could be found for this puzzle.');
        }
    };

    const handleHint = () => {
        const emptyCells: { row: number; col: number }[] = [];
    
        // جمع جميع الخلايا الفارغة
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (grid[row][col] === null) {
                    emptyCells.push({ row, col });
                }
            }
        }
    
        // التحقق من وجود خلايا فارغة
        if (emptyCells.length > 0) {
            // اختيار خلية عشوائية من الخلايا الفارغة
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            
            // تجربة الأرقام من 1 إلى 9
            for (let num = 1; num <= 9; num++) {
                if (isSafe(grid, row, col, num)) {
                    const newGrid = [...grid]; // نسخة عميقة
                    newGrid[row][col] = num;
                    setGrid(newGrid);
                    return;
                }
            }
        } else {
            alert('The board is fully filled. No hints are available!');
        }
    };
    

    // دالة معالجة تحميل الصورة
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // تحقق من أن الملف صورة
            if (!file.type.startsWith("image/")) {
                setOcrError("Please upload a valid image file.");
                return;
            }
    
            setLoading(true);  // عرض مؤشر التحميل أثناء معالجة الصورة
    
            try {
                const parsedBoard = await recognizeSudokuFromImage(file);
                if (parsedBoard) {
                    setGrid(parsedBoard);  // عرض الشبكة المعترَف بها
                    setOcrError(null);     // إزالة أي رسائل خطأ سابقة
                } else {
                    setOcrError("Could not recognize a Sudoku grid. Please upload a clearer image or check the image orientation.");
                }
            } catch (error) {
                setOcrError("An error occurred while processing the image. Please try again.");
            } finally {
                setLoading(false);  // إخفاء مؤشر التحميل
            }
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

            <h4>Upload an Image to Solve</h4>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {loading && <p>Processing image...</p>}
            {ocrError && <p style={{ color: 'red' }}>{ocrError}</p>}



        </div>
    )

};

export default SudokuBoard;

