export enum SplitDirection {
  HORIZONTAL = 'HORIZONTAL', // Cut horizontally (creates rows)
  VERTICAL = 'VERTICAL'      // Cut vertically (creates columns)
}

export interface SplitResult {
  id: number;
  dataUrl: string;
  width: number;
  height: number;
}