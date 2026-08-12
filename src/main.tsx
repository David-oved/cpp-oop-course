import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/monacoSetup';
import './styles/global.css';
import App from './App';
import { LESSONS } from './content';
import { wrapProject, wrapSnippet } from './lib/wrap';
import { runProject } from './lib/compile';

// כלי בדיקה לפיתוח בלבד: מאפשר לקמפל את כל בלוקי הקוד של השיעור מהקונסולה
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__dev = {
    LESSONS,
    wrapSnippet,
    wrapProject,
    runProject,
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
