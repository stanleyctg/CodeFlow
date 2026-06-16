import { FunctionInfo } from './types';

export function extractFunctionsFromFiles(files: string[]): FunctionInfo[] {
    return [{
        name: 'ignore',
        file: 'ignore.py',
        class: 'ignore'
    }];
}