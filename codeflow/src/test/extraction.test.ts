import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { extractFunctionsFromFiles, extractFilesFromWorkspace } from '../extraction';

function fixturesPath(filename: string): string {
    return path.join(__dirname, 'fixtures', filename);
}


suite('File Extraction Test Suite', () => {
    vscode.window.showInformationMessage('Start Extraction tests.');

    // test 1 extract all files from workspace
    test('extract all files from workspace folder', async() => {
        const findFilesMock = async (pattern: string): Promise<vscode.Uri[]> => {
            return [
                vscode.Uri.file(fixturesPath('test_workspace/1-.py')),
                vscode.Uri.file(fixturesPath('test_workspace/2-.py')),
                vscode.Uri.file(fixturesPath('test_workspace/3-.py'))
            ];
        };
        const result = await extractFilesFromWorkspace(findFilesMock);
        assert.deepStrictEqual(result, [
            fixturesPath('test_workspace/1-.py'),
            fixturesPath('test_workspace/2-.py'),
            fixturesPath('test_workspace/3-.py')
        ]);
    });


    // test 2 pop error message if workspace doesnt exist
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

    // test 3 return empty array if no files found in the workspace
    test('return empty array if no files found in the workspace', async() => {
        const findFilesMock = async (pattern: string): Promise<vscode.Uri[]> => {
            return [];
        };
        const result = await extractFilesFromWorkspace(findFilesMock);
        assert.deepStrictEqual(result, []);
    });

    // test 4 return all files in workspace, including files in subfolders
    test('return all files in workspace, including files in subfolders', async() => {
        const findFilesMock = async (pattern: string): Promise<vscode.Uri[]> => {
            return [
                vscode.Uri.file(fixturesPath('test_workspace_subfolder/1-.py')),
                vscode.Uri.file(fixturesPath('test_workspace_subfolder/2-.py')),
                vscode.Uri.file(fixturesPath('test_workspace_subfolder/test-subfolder/1-.py'))
            ];
        };
        const result = await extractFilesFromWorkspace(findFilesMock);
        assert.deepStrictEqual(result, [
            fixturesPath('test_workspace_subfolder/1-.py'),
            fixturesPath('test_workspace_subfolder/2-.py'),
            fixturesPath('test_workspace_subfolder/test-subfolder/1-.py')
        ]);
    });
});

suite('Function Extraction Test Suite', () => {
    vscode.window.showInformationMessage('Start Extraction tests.');

    test('extracts all functions from a file', async() => {
        const files = [fixturesPath('test_extract_file_1.py')];
        const result = await extractFunctionsFromFiles(files);
        assert.strictEqual(result.length, 1);
        assert.deepStrictEqual(result, [
            { name: 'bark', file: fixturesPath('test_extract_file_1.py'), class: 'Dog' }
        ]);
    });

    test('returns empty array when no functions found', async() => {
        const files = [fixturesPath('test_extract_empty_file.py')];
        const result = await extractFunctionsFromFiles(files);
        assert.strictEqual(result.length, 0);
    });

    test('extracts functions from multiple files', async() => {
        const files = [fixturesPath('test_extract_file_1.py'), fixturesPath('test_extract_file_2.py')];
        const result = await extractFunctionsFromFiles(files);
        assert.strictEqual(result.length, 5);
        assert.deepStrictEqual(result, [
            { name: 'bark', file: fixturesPath('test_extract_file_1.py'), class: 'Dog' },
            { name: 'add', file: fixturesPath('test_extract_file_2.py'), class: 'Calculator' },
            { name: 'subtract', file: fixturesPath('test_extract_file_2.py'), class: 'Calculator' },
            { name: 'multiply', file: fixturesPath('test_extract_file_2.py'), class: 'Calculator' },
            { name: 'divide', file: fixturesPath('test_extract_file_2.py'), class: 'Calculator' }
        ]);
    });

    test('extracts functions from files with no classes', async() => {
        const files = [fixturesPath('test_extract_file_3.py')];
        const result = await extractFunctionsFromFiles(files);
        assert.strictEqual(result.length, 3);
        assert.deepStrictEqual(result, [
            { name: 'meow', file: fixturesPath('test_extract_file_3.py'), class: undefined },
            { name: 'purr', file: fixturesPath('test_extract_file_3.py'), class: undefined },
            { name: 'hiss', file: fixturesPath('test_extract_file_3.py'), class: undefined }
        ])
    })
});
