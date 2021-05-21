// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { colorize } from './colorize'
import { updateConfiguration } from './configuration'

// TODO: 
// x Actions
//   x When to run
//   x In package definition, ensure able to load on text change and editor change
// - Review VS Code extension guidelines
// - Config
//   - colors
//   - exluded file types
//   - included variable types
//   - modes: adjacent vs hash
// "colorIdentifiersMode.coloringMethod": {
// 	"type": "boolean",
// 	"default": false,
// 	"description": "\"Sequential\" (the default) assigns colors to variables in the order that the variables appear in the file. \"Hash\" uses the variable's name to determine its color."
//   }
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
	updateConfiguration()
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(updateConfiguration))
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(handleActiveEditorChange))
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(handleTextDocumentChange))

	const editor = vscode.window.activeTextEditor
	if (editor != null) {
		colorize(editor)
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
