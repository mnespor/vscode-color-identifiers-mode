// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { colorize } from './colorize'
import { updateConfiguration } from './configuration'

// TODO: 
// x Actions
//   x When to run
//   x In package definition, ensure able to load on text change and editor change
// x Review VS Code extension guidelines
// - Config
//   x colors
//   x exluded file types
//   x included variable types
//   x modes: adjacent vs hash
//   - debounce interval
// x Refactor: Extract to files
// - Performance
//   - caching
//   - debouncing
// - Documentation
// - Gray themes

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

	const editor = vscode.window.activeTextEditor
	if (editor != null) {
		colorize(editor)
	}
}

export function deactivate() {}
