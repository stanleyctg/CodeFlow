export interface FunctionInfo {
    name: string
    file: string
    class?: string
}

export interface FunctionCalleesMap {
    function: FunctionInfo
    callees: FunctionInfo[]
}

export interface FunctionDependencyGraph {
    function: FunctionInfo
    callers: FunctionInfo[]
    callees: FunctionInfo[] 
}