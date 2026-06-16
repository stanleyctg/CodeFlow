import * as vscode from 'vscode';
import { FunctionInfo } from './types';

export function extractFunctionsFromFiles(files: string[]): FunctionInfo[] {
    return [{
        name: 'ignore',
        file: 'ignore.py',
        class: 'ignore'
    }];
}

// Dep inject with vscode.workspace.findFiles to make it easier to test
export async function extractFilesFromWorkspace(findFiles: (pattern: string) => Thenable<vscode.Uri[]>): Promise<string[]> {
    const uris = await findFiles('**/*.py');
    return uris.map(uri => uri.fsPath);
}