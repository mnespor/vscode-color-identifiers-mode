import * as vscode from 'vscode';

export function updateConfiguration() { 
    const configuration = vscode.workspace.getConfiguration('colorIdentifiersMode')
    tokenKinds = new Set(configuration.get('tokenKinds') ?? [])
    const colorNames: String[] = configuration.get('colors') ?? []
    colors = colorNames.map(color => vscode.window.createTextEditorDecorationType({ color }))
    ignoredLanguages = new Set(configuration.get('ignoredLanguages') ?? [])
}

export let tokenKinds: Set<string> = new Set(['variable', 'parameter', 'property'])

export let colors = [
	'#FF8080',
	'#80FF80',
	'#8080FF',
	'#FFFF80',
	'#FF80FF',
	'#80FFFF'
].map(color => vscode.window.createTextEditorDecorationType({ color }))

export let ignoredLanguages: Set<string> = new Set();

vscode.workspace.getConfiguration('myExtension')