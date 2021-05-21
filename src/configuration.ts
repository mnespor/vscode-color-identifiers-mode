import * as vscode from 'vscode';

export const tokenKinds: Set<string> = new Set(['variable', 'parameter'/*, 'property'*/])

export const colors = [
	vscode.window.createTextEditorDecorationType({ color: '#FF8080' }),
	vscode.window.createTextEditorDecorationType({ color: '#80FF80' }),
	vscode.window.createTextEditorDecorationType({ color: '#8080FF' }),
	vscode.window.createTextEditorDecorationType({ color: '#FFFF80' }),
	vscode.window.createTextEditorDecorationType({ color: '#FF80FF' }),
	vscode.window.createTextEditorDecorationType({ color: '#80FFFF' })
];
