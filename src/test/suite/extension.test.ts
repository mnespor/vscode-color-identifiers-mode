import * as assert from 'assert'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'
// import * as myExtension from '../../extension';

class Fred {

	constructor(name: string, occupation: string) {
		this.name = name
		this.occupation = occupation
	}

	name: string
	occupation: string
	nonsense() { return this.name + this.occupation }
}

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.')
	const fred = 27
	const width = 3
	const height = 4
	const depth = 4 
	const size = width * height
	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5))
		assert.strictEqual(-1, [1, 2, 3].indexOf(0))
	})
})
