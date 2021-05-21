// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { colorize } from './colorize'

// TODO: 
// - Actions
//   x When to run
//   x In package definition, ensure able to load on text change and editor change
// - Config
//   - colors
//   - exluded file types
//   - included variable types
//   - modes: adjacent vs hash
//   - debounce interval
// - Refactor: Extract to files
// - Performance
//   - narrow scope to just the edited range
//   - caching
//   - debouncing
// - Documentation
// - Gray themes
// - TS lint

interface SemanticToken {
	name: String
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

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	const editor = vscode.window.activeTextEditor
	if (editor != null) {
		colorize(editor)
	}

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(handleActiveEditorChange))
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(handleTextDocumentChange))
}

// this method is called when your extension is deactivated
export function deactivate() {}
