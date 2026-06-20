export interface FunctionInfo {
    name: string
    file: string
    class?: string
}

export interface FunctionCalleesMap {
    function: FunctionInfo
    callees?: FunctionInfo[]
}