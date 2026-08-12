import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { loader } from '@monaco-editor/react';

// Monaco נטען מקומית מה-bundle ולא מ-CDN, כדי שהאפליקציה תעבוד גם בלי אינטרנט.
(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

loader.config({ monaco });

let themesDefined = false;

export function defineThemes() {
  if (themesDefined) return;
  themesDefined = true;

  monaco.editor.defineTheme('cpp-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'ff9dbd' },
      { token: 'type', foreground: '6fd6c4' },
      { token: 'string', foreground: 'f0c674' },
      { token: 'number', foreground: 'f4a988' },
      { token: 'comment', foreground: '7d859e', fontStyle: 'italic' },
      { token: 'identifier', foreground: 'e4e8f5' },
      { token: 'delimiter', foreground: '98a0bb' },
      { token: 'operator', foreground: 'd6dbec' },
    ],
    colors: {
      'editor.background': '#0b0e19',
      'editor.foreground': '#e4e8f5',
      'editorLineNumber.foreground': '#565e7a',
      'editorLineNumber.activeForeground': '#a8b4ff',
      'editor.lineHighlightBackground': '#151a2c',
      'editor.selectionBackground': '#2c3350',
      'editorCursor.foreground': '#8b9bff',
      'editorIndentGuide.background1': '#20263c',
      'editorGutter.background': '#0b0e19',
    },
  });

  monaco.editor.defineTheme('cpp-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'a3246b' },
      { token: 'type', foreground: '0f7a6b' },
      { token: 'string', foreground: 'a35b06' },
      { token: 'number', foreground: 'b3541e' },
      { token: 'comment', foreground: '7b8199', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.lineHighlightBackground': '#f2f4fb',
    },
  });
}

export { monaco };
