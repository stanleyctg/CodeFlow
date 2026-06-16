import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { extractFunctionsFromFiles } from '../extraction';

function fixturesPath(filename: string): string {
    return path.join(__dirname, 'fixtures', filename);
}


suite('Extraction Test Suite', () => {
    vscode.window.showInformationMessage('Start Extraction tests.');

    test.skip('extracts all functions from a file', async() => {
        const files = [fixturesPath('test_extract_file_1.py')];
        const result = await extractFunctionsFromFiles(files);
        assert.strictEqual(result.length, 1);
        assert.deepStrictEqual(result, [
            { name: 'bark', file: fixturesPath('test_extract_file_1.py'), class: 'Dog' }
        ]);
    });

    test.skip('returns empty array when no functions found', async() => {
        const files = [fixturesPath('test_extract_empty_file.py')];
        const result = await extractFunctionsFromFiles(files);
        assert.strictEqual(result.length, 0);
    });

    test.skip('extracts functions from multiple files', async() => {
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
});
