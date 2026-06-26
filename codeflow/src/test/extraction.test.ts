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
        ]);
    });
});

suite('Function Callees Mapping Test Suite', () => {
    vscode.window.showInformationMessage('Stat callees mapping tests');
    test('extract all callees from function within same module', async() => {
        const files = [fixturesPath('test_map_callees/test_map_function_1.py')];
        const functions = [
            makeFunctionInfo('meow', fixturesPath('test_map_callees/test_map_function_1.py'), 'Cat'),
            makeFunctionInfo('cat_sound', fixturesPath('test_map_callees/test_map_function_1.py'), undefined)
        ];
        const result = await mapCalleesToFunction(files, functions);
        assert.strictEqual(result.length, 2);
        assert.deepStrictEqual(result, [
            { 
                name: makeFunctionInfo('meow', fixturesPath('test_map_callees/test_map_function_1.py'), 'Cat'),
                callees: [makeFunctionInfo('cat_sound', fixturesPath('test_map_callees/test_map_function_1.py'), undefined)]
            },
            { 
                name: makeFunctionInfo('cat_sound', fixturesPath('test_map_callees/test_map_function_1.py'), undefined),
                callees: []
            }
        ]);
    });

    test('extract callees from other module relative to the function', async() => {
       const files = [fixturesPath('test_map_callees/test_map_function_2.py')];
       const functions = [
            makeFunctionInfo('say_meow', fixturesPath('test_map_callees/test_map_function_2.py'), 'Meow'),
            makeFunctionInfo('say_woof', fixturesPath('test_map_callees/test_map_function_2.py'), undefined),
            makeFunctionInfo('meow', fixturesPath('test_map_callees/test_map_function_1.py'), 'Cat'),
            makeFunctionInfo('cat_sound', fixturesPath('test_map_callees/test_map_function_1.py'), undefined)
       ];
       const result = await mapCalleesToFunction(files, functions);
       assert.strictEqual(result.length, 2);
       assert.deepStrictEqual(result, [
            { 
                name:  makeFunctionInfo('say_meow', fixturesPath('test_map_callees/test_map_function_2.py'), 'Meow'),
                callees: [makeFunctionInfo('meow', fixturesPath('test_map_callees/test_map_function_1.py'), 'Cat')]
            },
            { 
                name: makeFunctionInfo('say_woof', fixturesPath('test_map_callees/test_map_function_2.py'), undefined),
                callees: []
            }
       ]);
    });

    test('extract callees which exist from same class', async() => {
        const files = [fixturesPath('test_map_callees/test_map_function_3.py')];
        const functions = [
            makeFunctionInfo('process_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
            makeFunctionInfo('complete_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
            makeFunctionInfo('save_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
            makeFunctionInfo('validate_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order')
        ];
        const result = await mapCalleesToFunction(files, functions);
        assert.strictEqual(result.length, 4);
        assert.deepStrictEqual(result, [
            {   
                name: makeFunctionInfo('process_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
                callees: [makeFunctionInfo('validate_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order')]
            },
            {
                name: makeFunctionInfo('complete_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
                callees: [makeFunctionInfo('save_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order')]
            },
            {
                name: makeFunctionInfo('save_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
                callees: []
            },
            {
                name: makeFunctionInfo('validate_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
                callees: []
            }
        ]);
    }); 

    test('return empty if all callees dont exist in function', async() => {
        const files = [fixturesPath('test_map_callees/test_map_function_4.py')];
        const functions = [
            makeFunctionInfo('call_print', fixturesPath('test_map_callees/test_map_function_4.py'), 'CallOtherLibrary'),
        ];
        const result = await mapCalleesToFunction(files, functions);
        assert.strictEqual(result.length, 1);
        assert.deepStrictEqual(result, [
            {
                name:  makeFunctionInfo('call_print', fixturesPath('test_map_callees/test_map_function_4.py'), 'CallOtherLibrary'),
                callees: []
            }
        ]);
    }); 

    test('extract callees from multiple files', async() => {
        const files = [fixturesPath('test_map_callees/test_map_function_1.py'),fixturesPath('test_map_callees/test_map_function_2.py'), 
            fixturesPath('test_map_callees/test_map_function_3.py')];
        const functions = [
            makeFunctionInfo('say_meow', fixturesPath('test_map_callees/test_map_function_2.py'), 'Meow'),
            makeFunctionInfo('say_woof', fixturesPath('test_map_callees/test_map_function_2.py'), undefined),
            makeFunctionInfo('meow', fixturesPath('test_map_callees/test_map_function_1.py'), 'Cat'),
            makeFunctionInfo('cat_sound', fixturesPath('test_map_callees/test_map_function_1.py'), undefined),
            makeFunctionInfo('process_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
            makeFunctionInfo('complete_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
            makeFunctionInfo('save_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
            makeFunctionInfo('validate_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order')
        ];
        const result = await mapCalleesToFunction(files, functions);
        assert.strictEqual(result.length, 8);
        assert.deepStrictEqual(result, [
            { 
                name: makeFunctionInfo('meow', fixturesPath('test_map_callees/test_map_function_1.py'), 'Cat'),
                callees: [makeFunctionInfo('cat_sound', fixturesPath('test_map_callees/test_map_function_1.py'), undefined)]
            },
            { 
                name: makeFunctionInfo('cat_sound', fixturesPath('test_map_callees/test_map_function_1.py'), undefined),
                callees: []
            },
            { 
                name:  makeFunctionInfo('say_meow', fixturesPath('test_map_callees/test_map_function_2.py'), 'Meow'),
                callees: [makeFunctionInfo('meow', fixturesPath('test_map_callees/test_map_function_1.py'), 'Cat')]
            },
            { 
                name: makeFunctionInfo('say_woof', fixturesPath('test_map_callees/test_map_function_2.py'), undefined),
                callees: []
            },
            {   
                name: makeFunctionInfo('process_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
                callees: [makeFunctionInfo('validate_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order')]
            },
            {
                name: makeFunctionInfo('complete_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
                callees: [makeFunctionInfo('save_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order')]
            },
            {
                name: makeFunctionInfo('save_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
                callees: []
            },
            {
                name: makeFunctionInfo('validate_order', fixturesPath('test_map_callees/test_map_function_3.py'), 'Order'),
                callees: []
            }
        ]);
    });
});
