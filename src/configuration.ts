import * as vscode from 'vscode'
import { ColorThemeKind } from 'vscode'
import * as colorConvert from 'color-convert'

export const Method = {
	sequential: 'sequential',
	hash: 'hash'
}

const PaletteMode = {
	automatic: 'automatic',
	manual: 'manual'
}

export function updateConfiguration() { 
    const configuration = vscode.workspace.getConfiguration('colorIdentifiersMode')
    tokenKinds = new Set(configuration.get('tokenKinds') ?? [])
    ignoredLanguages = new Set(configuration.get('ignoredLanguages') ?? [])
	method = configuration.get('method') ?? Method.sequential
	paletteMode = configuration.get('paletteMode') ?? PaletteMode.automatic
	generatePalette()
}

export function generatePalette() {
	colors.forEach(color => color.dispose())
	switch (paletteMode) {
		case PaletteMode.manual:
			const configuration = vscode.workspace.getConfiguration('colorIdentifiersMode')
			const colorNames: string[] = configuration.get('manualColors') ?? []
			colors = colorNames.map(color => vscode.window.createTextEditorDecorationType({ color }))
			break
		case PaletteMode.automatic:
		default:
			const saturation = 90
			const luminance = vscode.window.activeColorTheme.kind === ColorThemeKind.Light ? 30 : 80
			colors = [0.0, 0.5, 0.1, 0.6, 0.2, 0.7, 0.3, 0.8, 0.4, 0.9].map(hue => {
				const hex = colorConvert.hsl.hex([360.0 * hue, saturation, luminance])
				return vscode.window.createTextEditorDecorationType({ color: `#${hex}` })
			})
	}
}

let paletteMode = PaletteMode.automatic
export let tokenKinds: Set<string> = new Set(['variable', 'parameter', 'property'])
export let ignoredLanguages: Set<string> = new Set()
export let method: string = Method.sequential
export let colors = [
	'#FF00FF'
].map(color => vscode.window.createTextEditorDecorationType({ color }))

vscode.workspace.getConfiguration('myExtension')