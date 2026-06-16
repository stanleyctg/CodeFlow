import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myUtils from '..//utils';

suite('Utils Test Suite', () => {
    vscode.window.showInformationMessage('Start Utils tests.');

    test('returns selected text when text is highlighted', async() => {
        const document = await vscode.workspace.openTextDocument(
            {content: 'function process()'}
        );
        const editor = await vscode.window.showTextDocument(document);
        editor.selection = new vscode.Selection(0, 9, 0, 18); // Highlight "process()"

        // Simulate running the command
        const result = myUtils.getSelectedText(editor);

        // Check the information message
        assert.strictEqual(result, 'process()');
    });

    test('returns empty string when no text is highlighted', async() => {
        const document = await vscode.workspace.openTextDocument(
            {content: 'function process()'}
        );
        const editor = await vscode.window.showTextDocument(document);
        editor.selection = new vscode.Selection(0, 0, 0, 0); // No text highlighted

        const result = myUtils.getSelectedText(editor);

        assert.strictEqual(result, '');
    });

    test('returns single character when single character is highlighted', async() => {
        const document = await vscode.workspace.openTextDocument(
            {content: 'function process()'}
        );
        const editor = await vscode.window.showTextDocument(document);
        editor.selection = new vscode.Selection(0, 9, 0, 10); // Highlight "p"

        const result = myUtils.getSelectedText(editor);

        assert.strictEqual(result, 'p');
    });
});

