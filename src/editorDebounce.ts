import * as vscode from 'vscode'

type EditorFunction = (editor: vscode.TextEditor) => void

export function debounce(func: EditorFunction, delay: number): EditorFunction {
    const lastExecutionTimes = new Map<string, number>()

    return (editor: vscode.TextEditor) => {
        const now = Date.now()
        const key = editor.document.uri.toString()
        const lastExecution = lastExecutionTimes.get(key) || 0

        if (now - lastExecution >= delay) {
            func(editor)
            lastExecutionTimes.set(key, now)
        }
    }
}