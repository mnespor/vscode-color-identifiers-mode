// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

// TODO: 
// - Actions: when to run
// - Config
//   - colors
//   - exluded file types
//   - included variable types
//   - modes: adjacent vs hash
// - Refactor: Extract to files
// - Performance
//   - narrow scope to just the edited range
//   - caching
// - Documentation
// - Gray themes
// - TS lint

const colors = [

]

// probably don't need this; just walk the tree on demand.
function flattenSymbols(symbols: vscode.DocumentSymbol[] | vscode.SymbolInformation[]): (vscode.DocumentSymbol | vscode.SymbolInformation)[] {
	let symbolLists: (vscode.DocumentSymbol | vscode.SymbolInformation)[][] = []
	for (const symbol of symbols) {
		symbolLists.push([symbol])
		if ('children' in symbol) {
			symbolLists.push(flattenSymbols(symbol.children))
		}
	}

	return symbolLists.flat()
}

async function blah() {
	// https://code.visualstudio.com/api/references/commands
	// Symbol provider seems the most useful so far. NOTE it's a tree.

	const uri = vscode.window.activeTextEditor?.document.uri
	const position = new vscode.Position(7, 13)
	const symbols = await vscode.commands.executeCommand('vscode.executeWorkspaceSymbolProvider', '')
	// NOTE: flutter LSP support doesn't work without the flutter CLI tool installed
	const symbols2: vscode.DocumentSymbol[] | vscode.SymbolInformation[] | undefined = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', uri) // this one
	const symbols3: vscode.SemanticTokens | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', uri)
	const symbols4 = await vscode.commands.executeCommand('vscode.executeDocumentHighlights', uri, position)
	const legend = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', uri)
	// grab the selectionRange
	const flatStuff = flattenSymbols(symbols2 ?? [])
	return symbols
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "color-identifiers-mode" is now active!')

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-color-identifiers-mode.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const editor = vscode.window.activeTextEditor
		vscode.window.showInformationMessage(`Color is hi`)
		const magentaType = vscode.window.createTextEditorDecorationType({ color: '#FF00FF' })
		const cyanType = vscode.window.createTextEditorDecorationType({ color: `#00FFFF` })
		const type = Math.random() < 0.5 ? magentaType : cyanType
		editor?.setDecorations(magentaType, [])
		editor?.setDecorations(cyanType, [])
		editor?.setDecorations(cyanType, [new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(10))])
		blah().then(s => {
			vscode.window.showInformationMessage(`Color is hi`)
		})
	})

	context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {}
