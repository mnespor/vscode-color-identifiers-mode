import * as vscode from 'vscode';
import { rangesByName } from './rangesByName';
import { colors, ignoredLanguages } from "./configuration";

let rangeLists: vscode.Range[][] = colors.map(_ => [])

export async function colorize(editor: vscode.TextEditor): Promise<void> {
	const uri = editor.document.uri;
	if (uri == null || ignoredLanguages.has(editor.document.languageId)) { return; }
	const legend: vscode.SemanticTokensLegend | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', uri);
	const tokensData: vscode.SemanticTokens | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', uri);
	rangeLists = colors.map(_ => []);
	if (tokensData == null || legend == null) { return; }
	Object.values(rangesByName(tokensData, legend, editor)).forEach((ranges, index) => {
		const colorIndex = index % rangeLists.length;
		rangeLists[colorIndex] = rangeLists[colorIndex].concat(ranges);
	});

	colors.forEach((color, index) => {
		editor.setDecorations(color, rangeLists[index]);
	});
}
