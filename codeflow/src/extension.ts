// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getSelectedText, 
	extractFilesFromWorkspace, 
	extractFunctionsFromFiles, 
	mapCalleesToFunction, 
	buildFunctionDependencyGraph, 
	mapSelectedTextToFunctionGraph } from './extraction';
import { generateVisualFromDependencyNode } from './visualiser';

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
	
	const extractFunctionsDisposable = vscode.commands.registerCommand('codeflow.extractFunctions', async () => {
		const files = await extractFilesFromWorkspace(vscode.workspace.findFiles);
		const functions = await extractFunctionsFromFiles(files);
		const functionCalleeMap = await mapCalleesToFunction(files, functions);
		const functionDependencyGraph = await buildFunctionDependencyGraph(functionCalleeMap);
		const editor = vscode.window.activeTextEditor;
		const selectedText = getSelectedText(editor!);
		const functionNodeView = mapSelectedTextToFunctionGraph(selectedText, functionDependencyGraph)
		functionNodeView ? 
		generateVisualFromDependencyNode(functionNodeView, context): 
		vscode.window.showErrorMessage('Text selected is not a function');
	});

	context.subscriptions.push(extractFunctionsDisposable);

}

// This method is called when your extension is deactivated
export function deactivate() {}
