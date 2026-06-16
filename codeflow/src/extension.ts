// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getSelectedText } from './utils';
import { extractFilesFromWorkspace } from './extraction';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeflow" is now active!');

	const generateGraphDisposable = vscode.commands.registerCommand('codeflow.generateDependencyGraph', () => {
		const editor = vscode.window.activeTextEditor;
		const selection = getSelectedText(editor!);

		selection ? vscode.window.showInformationMessage('Selected text: ' + selection)
		: vscode.window.showErrorMessage('No text selected');
	});

	context.subscriptions.push(generateGraphDisposable);
	
	const extractFilesDisposable = vscode.commands.registerCommand('codeflow.extractFiles', async () => {
		const files = await extractFilesFromWorkspace(vscode.workspace.findFiles);
		vscode.window.showInformationMessage(`${files}`);
	});

	context.subscriptions.push(extractFilesDisposable);

}

// This method is called when your extension is deactivated
export function deactivate() {}
