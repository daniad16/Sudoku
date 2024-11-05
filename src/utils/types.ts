// types.ts
export interface Cell {
    value: number | "";
    isEditable: boolean;
  }
  
  export type Board = Cell[][];
  