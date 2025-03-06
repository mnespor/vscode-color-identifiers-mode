import * as vscode from 'vscode'
import { debounce } from './editorDebounce'
import { colorize } from './colorize'
import { updateConfiguration } from './configuration'
import { generatePalette } from "./configuration"

const colorizeIfNeeded = debounce((editor: vscode.TextEditor) => colorize(editor), 200)

interface SemanticToken {
	name: string
	range: vscode.Range
}

function handleVisibleEditorsChange(editors: readonly vscode.TextEditor[]) {
	editors.forEach(editor => {
		colorizeIfNeeded(editor)
	})
}

function handleColorThemeChange() {
	generatePalette()
	const editors = vscode.window.visibleTextEditors
	editors.forEach(editor => {
		colorizeIfNeeded(editor)
	})
}

function handleTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
	const editor = vscode.window.activeTextEditor
	if (editor != null && editor.document === event.document) {
		colorizeIfNeeded(editor)
	}
}

export function activate(context: vscode.ExtensionContext) {
	updateConfiguration()
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(updateConfiguration))
	context.subscriptions.push(vscode.window.onDidChangeVisibleTextEditors(handleVisibleEditorsChange))
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(handleTextDocumentChange))
	context.subscriptions.push(vscode.window.onDidChangeActiveColorTheme(handleColorThemeChange))

	const editors = vscode.window.visibleTextEditors
	editors.forEach(editor => {
		colorizeIfNeeded(editor)
	})
}

export function deactivate() {}
