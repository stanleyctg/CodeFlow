import * as vscode from 'vscode';

export function getSelectedText(editor: vscode.TextEditor): string {
    const selection = editor.document.getText(editor.selection);
    return selection ? selection : '';
}