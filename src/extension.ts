// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { Range } from 'vscode'

// TODO: 
// - Actions: when to run
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

const colors = [
	vscode.window.createTextEditorDecorationType({ color: '#FF0000' }),
	vscode.window.createTextEditorDecorationType({ color: '#00FF00' }),
	vscode.window.createTextEditorDecorationType({ color: '#0000FF' }),
	vscode.window.createTextEditorDecorationType({ color: '#FFFF00' }),
	vscode.window.createTextEditorDecorationType({ color: '#FF00FF' }),
	vscode.window.createTextEditorDecorationType({ color: '#00FFFF' }),
	vscode.window.createTextEditorDecorationType({ color: '#800000' }),
	vscode.window.createTextEditorDecorationType({ color: '#008000' }),
	vscode.window.createTextEditorDecorationType({ color: '#000080' }),
	vscode.window.createTextEditorDecorationType({ color: '#808000' }),
	vscode.window.createTextEditorDecorationType({ color: '#800080' }),
	vscode.window.createTextEditorDecorationType({ color: '#008080' }),
]

let rangeLists: vscode.Range[][] = colors.map(_ => [])

const symbolKinds: Set<vscode.SymbolKind> = new Set([vscode.SymbolKind.Variable, vscode.SymbolKind.TypeParameter, vscode.SymbolKind.Field])
const bantSymbolKinds: Set<vscode.SymbolKind> = new Set([
	vscode.SymbolKind.Class,
	vscode.SymbolKind.Function,
	vscode.SymbolKind.Constructor,
	vscode.SymbolKind.Method
])

// probably don't need this; just walk the tree on demand.
function flattenSymbols(symbols: vscode.DocumentSymbol[] | vscode.SymbolInformation[]): (vscode.DocumentSymbol | vscode.SymbolInformation)[] {
	let symbolLists: (vscode.DocumentSymbol | vscode.SymbolInformation)[][] = []
	for (const symbol of symbols) {
		if (!bantSymbolKinds.has(symbol.kind)) {
			symbolLists.push([symbol])
		} 

		if ('children' in symbol) {
			symbolLists.push(flattenSymbols(symbol.children))
		}
	}

	return symbolLists.flat()
}

type SymbolGroup = Record<string, (vscode.DocumentSymbol | vscode.SymbolInformation)[]>

function grouped(symbols: (vscode.DocumentSymbol | vscode.SymbolInformation)[]): SymbolGroup {
	const symbolListsByName: SymbolGroup = {}
	symbols.forEach(symbol => {
		if (symbolListsByName[symbol.name] == null) {
			symbolListsByName[symbol.name] = [symbol]
		} else {
			symbolListsByName[symbol.name].push(symbol)
		}
	})

	return symbolListsByName
}

async function blah() {
	// https://code.visualstudio.com/api/references/commands
	// Symbol provider seems the most useful so far. NOTE it's a tree.

	const uri = vscode.window.activeTextEditor?.document.uri
	const position = new vscode.Position(7, 13)
	const symbols = await vscode.commands.executeCommand('vscode.executeWorkspaceSymbolProvider', '')
	// NOTE: flutter LSP support doesn't work without the flutter CLI tool installed
	// NOTE: symbol list doesn't work. It includes local variables for neither typescript nor dart. Probably gotta decode the semantic token list
	// NOTE: dart lsp doesn't provide semantic tokens!?
	//       - nah, just need to enable dart-code's preview LSP
	// NOTE: sourcekit-lsp is very experimental; see https://github.com/apple/sourcekit-lsp/tree/main/Editors/vscode
	const symbols2: vscode.DocumentSymbol[] | vscode.SymbolInformation[] | undefined = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', uri) // this one
	const symbols3: vscode.SemanticTokens | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', uri)
	const symbols4 = await vscode.commands.executeCommand('vscode.executeDocumentHighlights', uri, position)
	const legend = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', uri)
	// grab the selectionRange
	const flatStuff = flattenSymbols(symbols2 ?? [])
	return symbols
}

function range(symbol: vscode.DocumentSymbol | vscode.SymbolInformation): vscode.Range {
	if (symbol instanceof vscode.DocumentSymbol) {
		return symbol.selectionRange
	} else if (symbol instanceof vscode.SymbolInformation) {
		return symbol.location.range
	}

	return new vscode.Range(0, 0, 0, 0)
}

async function colorize(editor: vscode.TextEditor): Promise<void> {
	const uri = editor.document.uri
	if (uri == null) { return }
	const symbolTree: vscode.DocumentSymbol[] | vscode.SymbolInformation[] | undefined = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', uri)
	const symbols = (symbolTree && flattenSymbols(symbolTree)) ?? []
	rangeLists = colors.map(_ => [])
	Object.values(grouped(symbols)).forEach((symbolList, index) => {
		const colorIndex = index % rangeLists.length
		const ranges = symbolList.map(range)
		rangeLists[colorIndex] = rangeLists[colorIndex].concat(ranges)
	})

	colors.forEach((color, index) => {
		editor.setDecorations(color, rangeLists[index])
	})
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
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "color-identifiers-mode" is now active!')

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(handleActiveEditorChange))
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(handleTextDocumentChange))

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
