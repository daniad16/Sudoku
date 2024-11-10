import Tesseract from 'tesseract.js';

export const recognizeSudokuFromImage = async (file:any) => {
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng');
        
        // معالجة النص لإزالة المسافات الفارغة وتحويله إلى شبكة
        const digits = text.replace(/\D/g, '');  // إزالة أي رموز غير الأرقام
        if (digits.length !== 81) {
            return null;  // إذا لم يكن لدينا 81 رقم، نعتبر الصورة غير مكتملة
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
