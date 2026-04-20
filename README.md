# CodeFlow

**Dependency graphs and interactive visualisations for any function in your codebase.**

Highlight a function in VS Code, run a command, and get two things instantly — a dependency graph showing everything that calls it and everything it calls, and an AI-generated interactive simulation showing how the function actually behaves with real data. No context switching, no copy-pasting into AI chat, no manually tracing through files.

---

## The problem

Working in a large codebase means constantly asking:

- *What will break if I change this function?*
- *Who is actually calling this?*
- *What does this function depend on?*

Today you answer those questions by grepping, scrolling, and building a mental map from scratch every time. CodeFlow makes that map visible in seconds.

---

## How it works

1. Highlight a function name in your Python file
2. Open the command palette and run `CodeFlow: Show Dependencies`
3. Two panels open alongside your editor

**Panel 1 — dependency graph.** Shows every function that calls yours (callers) and every function yours calls (callees), with the class name and file for each node. Click any node to highlight its connections.

**Panel 2 — interactive visualisation.** An AI-generated simulation of your function's behaviour using real data shapes inferred from your actual codebase. Not a static diagram — a live widget you can interact with.

The whole flow takes under 3 seconds from highlight to rendered output.

---

## Installation

**Requirements**
- VS Code 1.75 or later
- Python 3.8 or later
- Node.js 18 or later

**Install from source (PoC)**

```bash
git clone https://github.com/stanleyctg/CodeFlow.git
cd CodeFlow
npm install
pip install -r requirements.txt
npm run build
```

Then in VS Code:
- Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
- Run `Extensions: Install from VSIX`
- Select the generated `.vsix` file from the project root

---

## Usage

Open any Python project in VS Code. Place your cursor inside or highlight any function name. Then:

```
Cmd+Shift+P → CodeFlow: Show Dependencies
```

The graph panel opens to the side of your current file. Your code stays in focus — the graph lives alongside it without replacing your editor layout.

**Reading the graph**

| Colour | Meaning |
|--------|---------|
| Purple | The function you selected |
| Green  | Callers — functions that call into it |
| Grey   | Callees — functions it calls outward |

Click any node to see its class, file path, and relationship. Click the background to reset.

---

## How it works under the hood

CodeFlow has two distinct pipelines that run in sequence every time you trigger the command.

**Pipeline 1 — the dependency analyser**

`analyser.py` uses Tree-sitter to parse your Python files statically — no code execution, no network requests. It does two passes: first it walks every `.py` file in your workspace and builds an in-memory map of every function, its class, its file, and what it calls. Then it queries that map for your highlighted function — callees come directly from the map entry, callers come from a reverse lookup across the whole map.

The output is a JSON package containing the full function body, caller signatures, and callee signatures. Signatures are used instead of full dependency code to keep the context lightweight without losing meaning.

**Pipeline 2 — the AI visualisation**

The JSON package from Pipeline 1 is sent to an AI with a prompt asking it to generate an interactive HTML simulation. Because the AI receives real class names, real file paths, and real function signatures from your actual codebase — not just a pasted snippet — the simulation it generates is grounded in your specific architecture. The returned HTML is injected directly into the VS Code webview panel.

**What it handles well**
- Standard function and method calls
- Calls across files and modules
- Class method attribution
- Sequential transformation pipelines, algorithmic functions, state-based logic

**Current limitations (PoC)**
- Python only — Java, C++, and TypeScript support planned
- Dynamic calls (functions stored in variables and called later) are not tracked
- External library calls are shown as leaf nodes only
- AI visualisation quality varies by function type — spatial and algorithmic functions visualise best

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Editor integration | VS Code Extension API (TypeScript) |
| Code parsing | Tree-sitter (Python) |
| Dependency graph rendering | Cytoscape.js (HTML + JavaScript) |
| AI visualisation | Claude API |
| Glue layer | TypeScript calls Python as a subprocess |

---

## Project structure

```
CodeFlow/
├── src/
│   ├── extension.ts      # VS Code entry point, command registration
│   ├── visualiser.ts     # Builds AI prompt, calls Claude API, injects HTML
│   └── webview.html      # Cytoscape graph renderer
├── analyser.py           # Tree-sitter parsing, dependency map builder
├── requirements.txt      # Python dependencies (tree-sitter)
├── package.json
└── README.md
```

---

## Contributing

This is an early PoC. Contributions, issues, and feedback are very welcome.

If you hit a bug or want to request a feature, open an issue with a description of your codebase setup and what you expected to see.

To extend support to a new language, the entry point is `analyser.py` — Tree-sitter has grammars for most major languages so adding one is a contained change.

---

## Licence

MIT
