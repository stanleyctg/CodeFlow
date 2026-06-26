import * as vscode from 'vscode';
import * as fs from 'fs';
import { FunctionInfo, FunctionCalleesMap } from './types';

import Parser from 'tree-sitter';
import Python from 'tree-sitter-python';

const parser = new Parser();
parser.setLanguage(Python as unknown as Parser.Language);

export function extractFunctionsFromFiles(files: string[]): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    for (const file of files) {
        const code = fs.readFileSync(file, 'utf-8');
        const tree = parser.parse(code);
        const query = new Parser.Query(
            parser.getLanguage(),
            `(function_definition name: (identifier) @function.name)`
        );
        const functionNodes = query.matches(tree.rootNode);
        for (const functionNode of functionNodes) {
            (functionNode.captures[0].node.text !== '__init__')?functions.push({
                name: functionNode.captures[0].node.text,
                file: file,
                class: getClassName(functionNode.captures[0].node)
            }): null;
        }
    }
    return functions;
}

// Dep inject with vscode.workspace.findFiles to make it easier to test
export async function extractFilesFromWorkspace(findFiles: (pattern: string) => Thenable<vscode.Uri[]>): Promise<string[]> {
    const uris = await findFiles('**/*.py');
    return uris.map(uri => uri.fsPath);
}

export function mapCalleesToFunction(files: string[], functions: FunctionInfo[]): FunctionCalleesMap[] {
    return [{
        function: {name: 'ignore', file: 'ignore', class: 'ignore'},
        callees: []
    }];
}

// helper functions
function getClassName(node: Parser.SyntaxNode): string | undefined {
    let current = node.parent;
    while (current) {
        if (current.type === 'class_definition') {
            return current.childForFieldName('name')?.text;
        }
        current = current.parent;
    }
    return undefined;
}