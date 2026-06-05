import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myUtils from '..//utils';

suite('Utils Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    // test for first feature: display selected text in information message
    // 1. When command is ran with highlighted text, it should show the highlighted text in the information message
    test('returns selected text when text is highlighted', async() => {
        // Simulate the command being run with highlighted text
        const document = await vscode.workspace.openTextDocument(
            {content: 'function process()'}
        );
        const editor = await vscode.window.showTextDocument(document);
        editor.selection = new vscode.Selection(0, 9, 0, 18); // Highlight "process()"

        // Simulate running the command
        const result = myUtils.getSelectedText(editor);

        // Check the information message
        assert.strictEqual(result, 'process()');
    })
    // 2. When command is ran without highlighted text, it should show '' in the information message
    test('returns empty string when no text is highlighted', async() => {
        const document = await vscode.workspace.openTextDocument(
            {content: 'function process()'}
        );
        const editor = await vscode.window.showTextDocument(document);
        editor.selection = new vscode.Selection(0, 0, 0, 0); // No text highlighted

        const result = myUtils.getSelectedText(editor);

        assert.strictEqual(result, '');
    })
    // 3. When command is ran with single highlighted character, it should show "{char}" in the information message
    test('returns single character when single character is highlighted', async() => {
        const document = await vscode.workspace.openTextDocument(
            {content: 'function process()'}
        );
        const editor = await vscode.window.showTextDocument(document);
        editor.selection = new vscode.Selection(0, 9, 0, 10); // Highlight "p"

        const result = myUtils.getSelectedText(editor);

        assert.strictEqual(result, 'p');
    })
});

