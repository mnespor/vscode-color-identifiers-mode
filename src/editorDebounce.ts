import * as vscode from 'vscode'

type EditorFunction = (editor: vscode.TextEditor) => Promise<boolean>

export function debounce(func: EditorFunction, delay: number): (editor: vscode.TextEditor) => void {
    const lastExecutionTimes = new Map<string, number>()

    return async (editor: vscode.TextEditor) => {
        const now = Date.now()
        const key = editor.document.uri.toString()
        const lastExecution = lastExecutionTimes.get(key) || 0

        if (now - lastExecution >= delay) {
            if (await func(editor)) {
                lastExecutionTimes.set(key, now)
            } else {
                setTimeout(() => debounce(func, delay)(editor), delay)
            }
        }
    }
}