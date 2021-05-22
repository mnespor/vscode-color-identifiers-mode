import * as vscode from 'vscode'
import { colorize } from './colorize'
import { updateConfiguration } from './configuration'
import { generatePalette } from "./configuration"

interface SemanticToken {
	name: string
	range: vscode.Range
}

function handleActiveEditorChange(editor: vscode.TextEditor | undefined) {
	if (editor == null) {
		return
	}

	colorize(editor)
}

function handleColorThemeChange() {

}

function handleTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
	const editor = vscode.window.activeTextEditor
	if (editor != null && editor.document == event.document) {
		colorize(editor)
	}
}

export function activate(context: vscode.ExtensionContext) {
	updateConfiguration()
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(updateConfiguration))
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(handleActiveEditorChange))
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(handleTextDocumentChange))
	context.subscriptions.push(vscode.window.onDidChangeActiveColorTheme(handleColorThemeChange))

	const editor = vscode.window.activeTextEditor
	if (editor != null) {
		colorize(editor)
	}
}

export function deactivate() {}
