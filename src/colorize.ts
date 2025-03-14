import * as vscode from 'vscode'
import * as murmurhash from 'murmurhash'
import { rangesByName } from './rangesByName'
import { colors, ignoredLanguages, method, Method, bigFileSize } from "./configuration"

let rangeLists: vscode.Range[][] = colors.map(_ => [])

function colorIndexOfSymbol(symbolName: string, symbolIndex: number): number {
	switch (method) {
		case Method.hash:
			return murmurhash.v3(symbolName) % rangeLists.length
		case Method.sequential:
		default:
			return symbolIndex % rangeLists.length
	}
}

export async function colorize(editor: vscode.TextEditor): Promise<boolean> {
	const uri = editor.document.uri
	if (uri == null || ignoredLanguages.has(editor.document.languageId) || uri.scheme === "git") { return true }
	const stat = await vscode.workspace.fs.stat(uri)
	if (stat.size > bigFileSize) { return true }
	const legend: vscode.SemanticTokensLegend | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', uri)
	const tokensData: vscode.SemanticTokens | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', uri)
	rangeLists = colors.map(_ => [])
	if (tokensData == null || legend == null) { return false }
	const rangesBySymbolName = rangesByName(tokensData, legend, editor)
	Object.keys(rangesBySymbolName).forEach((name, index) => {
		const ranges = rangesBySymbolName[name]
		const colorIndex = colorIndexOfSymbol(name, index)
		rangeLists[colorIndex] = rangeLists[colorIndex].concat(ranges)
	})

	colors.forEach((color, index) => {
		editor.setDecorations(color, rangeLists[index])
	})

	return true
}
