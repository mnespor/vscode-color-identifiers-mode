import * as vscode from 'vscode';

export const Method = {
	sequential: 'sequential',
	hash: 'hash'
}

export function updateConfiguration() { 
    const configuration = vscode.workspace.getConfiguration('colorIdentifiersMode')
    tokenKinds = new Set(configuration.get('tokenKinds') ?? [])
    const colorNames: string[] = configuration.get('colors') ?? []
    colors = colorNames.map(color => vscode.window.createTextEditorDecorationType({ color }))
    ignoredLanguages = new Set(configuration.get('ignoredLanguages') ?? [])
	method = configuration.get('method') ?? Method.sequential
}

export function generatePalette() {
	vscode.window.activeColorTheme.kind
	new vscode.ThemeColor('editor.background')
	// TODO: implement
}

export let tokenKinds: Set<string> = new Set(['variable', 'parameter', 'property'])
export let ignoredLanguages: Set<string> = new Set()
export let method: string = Method.sequential
export let colors = [
	'#FF8080',
	'#80FF80',
	'#8080FF',
	'#FFFF80',
	'#FF80FF',
	'#80FFFF'
].map(color => vscode.window.createTextEditorDecorationType({ color }))

vscode.workspace.getConfiguration('myExtension')