import * as vscode from 'vscode'

type EditorFunction = (editor: vscode.TextEditor) => Promise<boolean>

export function debounce(func: EditorFunction, delay: number): (editor: vscode.TextEditor) => void {
  const executionState = new Map<string, { lastCall: number; retries: number }>();

  return async function debounced(editor: vscode.TextEditor) {
    const now = Date.now();
    const key = editor.document.uri.toString();
    const state = executionState.get(key) ?? { lastCall: 0, retries: 0 };

    if (now - state.lastCall < delay) return;  // Throttle: wait until delay has passed before calling again

    if (await func(editor)) {  // Exit if actual call succeeded
      executionState.set(key, { lastCall: now, retries: 0 });
      return;
    }

    if (state.retries >= 3) {  // Cancel infinite loops on unsupported 'file://' types returning 'false', e.g. JSON
      executionState.delete(key);
      return;
    }

    // Retry on failure after delay
    executionState.set(key, { ...state, retries: state.retries + 1 });
    setTimeout(() => debounced(editor), delay);
  };
}