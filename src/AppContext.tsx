import { createContext, useContext } from 'react';

export interface IdeFile {
  name: string;
  code: string;
}

export interface IdeRequest {
  /** הקבצים לפתיחה בעורך. תמיד לפחות אחד. */
  files: IdeFile[];
  title?: string;
  stdin?: string;
  /** מזהה תרגיל — כדי לשמור את מה שהמשתמש כתב */
  exerciseId?: string;
  solution?: string;
  expectedOutput?: string;
}

export interface AppApi {
  /** פותח את פאנל ה-AI, אופציונלית עם הקשר צר ושאלה מוכנה */
  askAi: (focus?: string, focusLabel?: string, question?: string) => void;
  /** פותח את סביבת הפיתוח עם קוד התחלתי */
  openIde: (req: IdeRequest) => void;
  toast: (msg: string) => void;
}

export const AppCtx = createContext<AppApi>({
  askAi: () => {},
  openIde: () => {},
  toast: () => {},
});

export const useApp = () => useContext(AppCtx);
