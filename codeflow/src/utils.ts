import * as vscode from 'vscode';

export function getSelectedText(editor: vscode.TextEditor): string {
    const selection = editor.document.getText(editor.selection);
    if (selection) {
        return selection;
    } else {
        return '';
    }
}