// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { Range } from 'vscode'

// TODO: 
// - Actions
//   - When to run
//   - In package definition, ensure able to load on text change and editor change
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
	vscode.window.createTextEditorDecorationType({ color: '#FF8080' }),
	vscode.window.createTextEditorDecorationType({ color: '#80FF80' }),
	vscode.window.createTextEditorDecorationType({ color: '#8080FF' }),
	vscode.window.createTextEditorDecorationType({ color: '#FFFF80' }),
	vscode.window.createTextEditorDecorationType({ color: '#FF80FF' }),
	vscode.window.createTextEditorDecorationType({ color: '#80FFFF' })
]

let rangeLists: vscode.Range[][] = colors.map(_ => [])

const symbolKinds: Set<vscode.SymbolKind> = new Set([vscode.SymbolKind.Variable, vscode.SymbolKind.TypeParameter, vscode.SymbolKind.Field])
const tokenKinds: Set<string> = new Set(['variable', 'parameter'/*, 'property'*/])
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
	//const flatStuff = flattenSymbols(symbols2 ?? [])
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

async function symbolTreeColorize(editor: vscode.TextEditor): Promise<void> {
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

interface SemanticToken {
	name: String
	range: vscode.Range
}

        /**
         * Tokens in a file are represented as an array of integers. The position of each token is expressed relative to
         * the token before it, because most tokens remain stable relative to each other when edits are made in a file.
         *
         * ---
         * In short, each token takes 5 integers to represent, so a specific token `i` in the file consists of the following array indices:
         *  - at index `5*i`   - `deltaLine`: token line number, relative to the previous token
         *  - at index `5*i+1` - `deltaStart`: token start character, relative to the previous token (relative to 0 or the previous token's start if they are on the same line)
         *  - at index `5*i+2` - `length`: the length of the token. A token cannot be multiline.
         *  - at index `5*i+3` - `tokenType`: will be looked up in `SemanticTokensLegend.tokenTypes`. We currently ask that `tokenType` < 65536.
         *  - at index `5*i+4` - `tokenModifiers`: each set bit will be looked up in `SemanticTokensLegend.tokenModifiers`
         *
         * ---
         * ### How to encode tokens
         *
         * Here is an example for encoding a file with 3 tokens in a uint32 array:
         * ```
         *    { line: 2, startChar:  5, length: 3, tokenType: "property",  tokenModifiers: ["private", "static"] },
         *    { line: 2, startChar: 10, length: 4, tokenType: "type",      tokenModifiers: [] },
         *    { line: 5, startChar:  2, length: 7, tokenType: "class",     tokenModifiers: [] }
         * ```
         *
         * 1. First of all, a legend must be devised. This legend must be provided up-front and capture all possible token types.
         * For this example, we will choose the following legend which must be passed in when registering the provider:
         * ```
         *    tokenTypes: ['property', 'type', 'class'],
         *    tokenModifiers: ['private', 'static']
         * ```
         *
         * 2. The first transformation step is to encode `tokenType` and `tokenModifiers` as integers using the legend. Token types are looked
         * up by index, so a `tokenType` value of `1` means `tokenTypes[1]`. Multiple token modifiers can be set by using bit flags,
         * so a `tokenModifier` value of `3` is first viewed as binary `0b00000011`, which means `[tokenModifiers[0], tokenModifiers[1]]` because
         * bits 0 and 1 are set. Using this legend, the tokens now are:
         * ```
         *    { line: 2, startChar:  5, length: 3, tokenType: 0, tokenModifiers: 3 },
         *    { line: 2, startChar: 10, length: 4, tokenType: 1, tokenModifiers: 0 },
         *    { line: 5, startChar:  2, length: 7, tokenType: 2, tokenModifiers: 0 }
         * ```
         *
         * 3. The next step is to represent each token relative to the previous token in the file. In this case, the second token
         * is on the same line as the first token, so the `startChar` of the second token is made relative to the `startChar`
         * of the first token, so it will be `10 - 5`. The third token is on a different line than the second token, so the
         * `startChar` of the third token will not be altered:
         * ```
         *    { deltaLine: 2, deltaStartChar: 5, length: 3, tokenType: 0, tokenModifiers: 3 },
         *    { deltaLine: 0, deltaStartChar: 5, length: 4, tokenType: 1, tokenModifiers: 0 },
         *    { deltaLine: 3, deltaStartChar: 2, length: 7, tokenType: 2, tokenModifiers: 0 }
         * ```
         *
         * 4. Finally, the last step is to inline each of the 5 fields for a token in a single array, which is a memory friendly representation:
         * ```
         *    // 1st token,  2nd token,  3rd token
         *    [  2,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0 ]
         * ```
         *
         * @see [SemanticTokensBuilder](#SemanticTokensBuilder) for a helper to encode tokens as integers.
         * *NOTE*: When doing edits, it is possible that multiple edits occur until VS Code decides to invoke the semantic tokens provider.
         * *NOTE*: If the provider cannot temporarily compute semantic tokens, it can indicate this by throwing an error with the message 'Busy'.
         */
function rangesByName(data: vscode.SemanticTokens, legend: vscode.SemanticTokensLegend, editor: vscode.TextEditor): Record<string, vscode.Range[]> {
	const accumulator: Record<string, vscode.Range[]> = {}
	const recordSize = 5
	let line = 0
	let column = 0

	for (let i = 0; i < data.data.length; i += recordSize) {
		const [deltaLine, deltaColumn, length, kindIndex, _] = data.data.slice(i, i + recordSize)
		column = deltaLine == 0 ? column : 0
		line += deltaLine
		column += deltaColumn
		const range = new vscode.Range(line, column, line, column + length)
		const name = editor.document.getText(range)
		const kind = legend.tokenTypes[kindIndex]
		if (tokenKinds.has(kind)) {
			pushValue(accumulator, name, range)
		}
	}

	return accumulator
}

function pushValue<Element>(dictionary: Record<string, Element[]>, key: string, value: Element) {
	if (key in dictionary) {
		dictionary[key].push(value)
	} else {
		dictionary[key] = [value]
	}
}

async function colorize(editor: vscode.TextEditor): Promise<void> {
	const uri = editor.document.uri
	if (uri == null) { return }
	const legend: vscode.SemanticTokensLegend | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', uri)
	const tokensData: vscode.SemanticTokens | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', uri)
	rangeLists = colors.map(_ => [])
	if (tokensData == null || legend == null) { return }
	Object.values(rangesByName(tokensData, legend, editor)).forEach((ranges, index) => {
		const colorIndex = index % rangeLists.length
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
