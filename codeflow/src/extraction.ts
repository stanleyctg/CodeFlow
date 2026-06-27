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
        const tree = createTreeFromSourceFile(file);
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
    const functionCalleesMap: FunctionCalleesMap[] = []; 
    for (const file of files) {
        const tree = createTreeFromSourceFile(file);
        const aliasMap: Record<string, string> = createAliasMap(tree);
        const varTypeMap: Record<string, string> = createVarTypeMap(tree);

        const calleeQuery = new Parser.Query(
            parser.getLanguage(),
            `(call
                function: (attribute
                    object: (identifier) @callee.object
                    attribute: (identifier) @callee.method))
            
            (call
                function: (identifier) @callee.name)`
        );
        const functionNodes = tree.rootNode.descendantsOfType('function_definition');
        for (const functionNode of functionNodes) {
            const fnName = functionNode.childForFieldName('name')?.text;
            const functionResolved = functions.find(f => f.name === fnName && f.file === file);
            if (!functionResolved) continue;
            const callees = extractCalleesFromFunctionNode(functionNode, calleeQuery, functions, aliasMap, varTypeMap, file);
           
            functionCalleesMap.push({
                function: functionResolved,
                callees: callees
            })
        }
    }
    return functionCalleesMap;
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

function createTreeFromSourceFile(file: string): Parser.Tree {
    const code = fs.readFileSync(file, 'utf-8');
    const tree = parser.parse(code);
    return tree
}

function createAliasMap(tree: Parser.Tree): Record<string, string> {
    const aliasMap: Record<string, string> = {};
    const aliasQuery = new Parser.Query(
        parser.getLanguage(),
        `(import_from_statement
            name: (aliased_import
                name: (dotted_name) @import.name
                alias: (identifier) @import.alias))`
    );
    const aliasMatches = aliasQuery.matches(tree.rootNode);
    for (const match of aliasMatches) {
        const import_name = match.captures.find(c => c.name == 'import.name')?.node.text;
        const alias = match.captures.find(c => c.name == 'import.alias')?.node.text;
        if (import_name && alias) {
            aliasMap[alias] = import_name;
        }
    }
    return aliasMap;
}

function createVarTypeMap(tree: Parser.Tree): Record<string, string> {
    const varTypeMap: Record<string, string> = {};
    const varTypeQuery = new Parser.Query(
            parser.getLanguage(),
            `(assignment
                left: (identifier) @var.name
                right: (call
                    function: (identifier) @var.type))`
        );
    const varTypeMatches = varTypeQuery.matches(tree.rootNode);
    for (const match of varTypeMatches) {
        const varName = match.captures.find(v => v.name === 'var.name')?.node.text;
        const varType = match.captures.find(v => v.name === 'var.type')?.node.text;
        if (varName && varType) {
            varTypeMap[varName] = varType;
        }
    }
    return varTypeMap;
}

function resolveCallee(calleeMatch: Parser.QueryMatch,
    functions: FunctionInfo[],
    varTypeMap: Record<string, string>, 
    aliasMap: Record<string, string>,
    file: string
    ): FunctionInfo | undefined {
        const obj = calleeMatch.captures.find(c => c.name == 'callee.object')?.node.text;
        const method = calleeMatch.captures.find(c => c.name == 'callee.method')?.node.text;
        const directName = calleeMatch.captures.find(c => c.name == 'callee.name')?.node.text;

        let resolvedClass: string | undefined

        if (obj && method) {
            if (obj == 'self') {
                resolvedClass = getClassName(calleeMatch.captures[0].node);
            }
            else {
                const varType = varTypeMap[obj] ?? obj;
                resolvedClass = aliasMap[varType] ?? varType;
            }
            const callee = functions.find(f => f.name === method && f.class === resolvedClass);
            return callee
        } else if (directName) {
            const callee = functions.find(f => f.name === directName && f.file === file) ?? functions.find(f => f.name === directName);
            return callee
        }
}

function extractCalleesFromFunctionNode(functionNode: Parser.SyntaxNode, 
    calleeQuery: Parser.Query, 
    functions: FunctionInfo[], 
    varTypeMap: Record<string, string>, 
    aliasMap: Record<string, string>, 
    file: string
    ): FunctionInfo[] {
        const callees: FunctionInfo[] = [];
        const calleeMatches = calleeQuery.matches(functionNode);
        for (const calleeMatch of calleeMatches) {
            const callee = resolveCallee(calleeMatch, functions, aliasMap, varTypeMap, file);
            if (callee && !callees.includes(callee)) callees.push(callee);
        }
        return callees
}