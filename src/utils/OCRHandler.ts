import Tesseract from 'tesseract.js';

export const recognizeSudokuFromImage = async (file:any) => {
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng');
        
        const digits = text.replace(/\D/g, '');
        if (digits.length !== 81) {
            return null; 
        }

        const grid = [];
        for (let i = 0; i < 81; i += 9) {
            const row = digits.slice(i, i + 9).split('').map(num => parseInt(num, 10));
            grid.push(row);
        }
        return grid;
    } catch (error) {
        console.error("OCR failed:", error);
        return null;
    }
};
