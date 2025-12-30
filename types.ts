
export enum EditorMode {
  IDLE = 'IDLE',
  BRUSH = 'BRUSH',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT'
}

export interface HistoryItem {
  id: string;
  originalImage: string;
  editedImage: string;
  prompt: string;
  timestamp: number;
}
