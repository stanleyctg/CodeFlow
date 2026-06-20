import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

import { FunctionInfo } from '../types';
import { extractFunctionsFromFiles, extractFilesFromWorkspace, mapCalleesToFunction } from '../extraction';

function fixturesPath(filename: string): string {
    return path.join(__dirname, 'fixtures', filename);
}

function makeFunctionInfo(functionName: string, fileName: string, className?: string): FunctionInfo {
    return {
        name: functionName,
        file: fileName,
        class: className
    };
}


suite('File Extraction Test Suite', () => {
    vscode.window.showInformationMessage('Start Extraction tests.');

    test('extract all files from workspace folder', async() => {
        const findFilesMock = async (pattern: string): Promise<vscode.Uri[]> => {
            return [
                vscode.Uri.file(fixturesPath('test_extract_file/test_workspace/1-.py')),
                vscode.Uri.file(fixturesPath('test_extract_file/test_workspace/2-.py')),
                vscode.Uri.file(fixturesPath('test_extract_file/test_workspace/3-.py'))
            ];
        };
        const result = await extractFilesFromWorkspace(findFilesMock);
        assert.deepStrictEqual(result, [
            fixturesPath('test_extract_file/test_workspace/1-.py'),
            fixturesPath('test_extract_file/test_workspace/2-.py'),
            fixturesPath('test_extract_file/test_workspace/3-.py')
        ]);
    });

    test('pop error message if workspace doesnt exist', async() => {
        const findFilesMock = async (pattern: string): Promise<vscode.Uri[]> => {
            throw new Error('Workspace not found');
        };
        await assert.rejects(async () => {
            await extractFilesFromWorkspace(findFilesMock);
        }, {
            message: 'Workspace not found'
        });
    });

    test('return empty array if no files found in the workspace', async() => {
        const findFilesMock = async (pattern: string): Promise<vscode.Uri[]> => {
            return [];
        };
        const result = await extractFilesFromWorkspace(findFilesMock);
        assert.deepStrictEqual(result, []);
    });

    test('return all files in workspace, including files in subfolders', async() => {
        const findFilesMock = async (pattern: string): Promise<vscode.Uri[]> => {
            return [
                vscode.Uri.file(fixturesPath('test_extract_file/test_workspace_subfolder/1-.py')),
                vscode.Uri.file(fixturesPath('test_extract_file/test_workspace_subfolder/2-.py')),
                vscode.Uri.file(fixturesPath('test_extract_file/test_workspace_subfolder/test-subfolder/1-.py'))
            ];
        };
        const result = await extractFilesFromWorkspace(findFilesMock);
        assert.deepStrictEqual(result, [
            fixturesPath('test_extract_file/test_workspace_subfolder/1-.py'),
            fixturesPath('test_extract_file/test_workspace_subfolder/2-.py'),
            fixturesPath('test_extract_file/test_workspace_subfolder/test-subfolder/1-.py')
        ]);
    });
});

suite('Function Extraction Test Suite', () => {
    vscode.window.showInformationMessage('Start Extraction tests.');

    test('extracts all functions from a file', async() => {
        const files = [fixturesPath('test_extract_function/test_extract_file_1.py')];
        const result = await extractFunctionsFromFiles(files);
        assert.strictEqual(result.length, 1);
        assert.deepStrictEqual(result, [
            makeFunctionInfo('bark', fixturesPath('test_extract_function/test_extract_file_1.py'), 'Dog')
        ]);
    });

    test('returns empty array when no functions found', async() => {
        const files = [fixturesPath('test_extract_function/test_extract_empty_file.py')];
        const result = await extractFunctionsFromFiles(files);
        assert.strictEqual(result.length, 0);
    });

    test('extracts functions from multiple files', async() => {
        const files = [fixturesPath('test_extract_function/test_extract_file_1.py'), fixturesPath('test_extract_function/test_extract_file_2.py')];
        const result = await extractFunctionsFromFiles(files);
        assert.strictEqual(result.length, 5);
        assert.deepStrictEqual(result, [
            makeFunctionInfo('bark', fixturesPath('test_extract_function/test_extract_file_1.py'), 'Dog'),
            makeFunctionInfo('add', fixturesPath('test_extract_function/test_extract_file_2.py'), 'Calculator'),
            makeFunctionInfo('subtract', fixturesPath('test_extract_function/test_extract_file_2.py'), 'Calculator'),
            makeFunctionInfo('multiply', fixturesPath('test_extract_function/test_extract_file_2.py'), 'Calculator'),
            makeFunctionInfo('divide', fixturesPath('test_extract_function/test_extract_file_2.py'), 'Calculator')
        ]);
    });

    test('extracts functions from files with no classes', async() => {
        const files = [fixturesPath('test_extract_function/test_extract_file_3.py')];
        const result = await extractFunctionsFromFiles(files);
        assert.strictEqual(result.length, 3);
        assert.deepStrictEqual(result, [
            makeFunctionInfo('meow', fixturesPath('test_extract_function/test_extract_file_3.py'), undefined),
            makeFunctionInfo('purr', fixturesPath('test_extract_function/test_extract_file_3.py'), undefined),
            makeFunctionInfo('hiss', fixturesPath('test_extract_function/test_extract_file_3.py'), undefined)
        ])
    });
});

suite('Function Callees Mapping Test Suite', () => {
    vscode.window.showInformationMessage('Stat callees mapping tests');
    // test 1: All callees are extracted from each function within same module
    test('extract all callees from function within same module', async() => {
        const files = [fixturesPath('test_map_callees/test_map_function-1.py')]
        const functions = [
            makeFunctionInfo('meow', fixturesPath('test_map_callees/test_map_function-1.py'), 'Cat'),
            makeFunctionInfo('cat_sound', fixturesPath('test_map_callees/test_map_function-1.py'), undefined)
        ]
        const result = await mapCalleesToFunction(files, functions)
        assert.strictEqual(result.length, 2);
        assert.deepStrictEqual(result, [
            { name: makeFunctionInfo('meow', fixturesPath('test_map_callees/test_map_function-1.py'), 'Cat'),
                callees: [makeFunctionInfo('cat_sound', fixturesPath('test_map_callees/test_map_function-1.py'), undefined)]
            },
            { name: makeFunctionInfo('cat_sound', fixturesPath('test_map_callees/test_map_function-1.py'), undefined),
                callees: []
            }
        ]);
    });
    // test 2: All callees are extracted from each function from other module

    // test 3: All callees are extracted from the same class

    // test
});
