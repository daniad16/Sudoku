// types.ts
export interface Cell {
    value: number | "";
    isEditable: boolean;
    isConflit:boolean;
  }
  
  export type Board = Cell[][];
  