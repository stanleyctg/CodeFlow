import * as vscode from 'vscode';
import { FunctionDependencyGraph } from './types';

let currentPanel: vscode.WebviewPanel | undefined;

export function generateVisualFromDependencyNode(functionDependencyNode: FunctionDependencyGraph, context: vscode.ExtensionContext) {
    if (currentPanel){
        currentPanel.dispose();
    }

    currentPanel = vscode.window.createWebviewPanel(
        'CodeFlow',
        'Code Flow',
        vscode.ViewColumn.Beside,
        { enableScripts: true }
    );
    currentPanel.onDidDispose(() => {
        currentPanel = undefined;
    });

    currentPanel.webview.html = buildWebviewContent(functionDependencyNode);
}


function buildWebviewContent(graph: FunctionDependencyGraph) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
</body>
</html>`;
}
//     const nonce = getNonce();
//     const nodes: { data: { id: string; label: string; role: string } }[] = [];
//     const edges: { data: { source: string; target: string } }[] = [];

//     nodes.push({ data: { id: 'target', label: graph.function.name, role: 'target' } });

//     graph.callers.forEach((caller, i) => {
//         const id = `caller_${i}`;
//         nodes.push({ data: { id, label: caller.name, role: 'caller' } });
//         edges.push({ data: { source: id, target: 'target' } });
//     });

//     graph.callees.forEach((callee, i) => {
//         const id = `callee_${i}`;
//         nodes.push({ data: { id, label: callee.name, role: 'callee' } });
//         edges.push({ data: { source: 'target', target: id } });
//     });

//     const elements = JSON.stringify([...nodes, ...edges]);

//     return `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src https://unpkg.com 'nonce-${nonce}'; style-src 'unsafe-inline';">
//     <style>
//         body { margin: 0; padding: 0; background: #1e1e1e; }
//     </style>
// </head>
// <body>
//     <div id="cy" style="width: 100%; height: 100vh;"></div>
//     <script src="https://unpkg.com/cytoscape@3.28.1/dist/cytoscape.min.js"></script>
//     <script nonce="${nonce}">
//         const cy = cytoscape({
//             container: document.getElementById('cy'),
//             elements: ${elements},
//             style: [
//                 {
//                     selector: 'node',
//                     style: {
//                         'label': 'data(label)',
//                         'text-valign': 'center',
//                         'text-halign': 'center',
//                         'color': '#fff',
//                         'font-size': '12px',
//                         'width': 'label',
//                         'height': 'label',
//                         'padding': '10px',
//                         'text-wrap': 'wrap'
//                     }
//                 },
//                 { selector: 'node[role="target"]', style: { 'background-color': '#9b59b6' } },
//                 { selector: 'node[role="caller"]', style: { 'background-color': '#2ecc71' } },
//                 { selector: 'node[role="callee"]', style: { 'background-color': '#95a5a6' } },
//                 {
//                     selector: 'edge',
//                     style: {
//                         'target-arrow-shape': 'triangle',
//                         'curve-style': 'bezier',
//                         'line-color': '#aaaaaa',
//                         'target-arrow-color': '#aaaaaa',
//                         'width': 2
//                     }
//                 }
//             ],
//             layout: { name: 'breadthfirst', directed: true, padding: 30, spacingFactor: 1.5 }
//         });
//     </script>
// </body>
// </html>`;
// }

// function getNonce() {
//     let text = '';
//     const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     for (let i = 0; i < 32; i++) {
//         text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//     return text;
// }