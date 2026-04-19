# CodeFlow

**Visual dependency graphs for any function in your codebase.**

Highlight a function in VS Code, run a command, and instantly see everything that calls it and everything it calls — rendered as an interactive graph inside your editor. No context switching, no copy-pasting into AI chat, no manually tracing through files.

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
3. A graph panel opens alongside your editor showing the full dependency picture

Each node shows the function name, its class, and the file it lives in. Click any node to highlight its connections. The graph updates every time you run the command on a new function.

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

## How it analyses your code

CodeFlow uses **Tree-sitter** to parse your Python files statically — no code execution, no AI, no network requests. Everything runs locally on your machine.

The analyser is written in Python (`analyser.py`) and called by the VS Code extension as a subprocess. It scans your workspace on startup, builds a map of every function, which class it belongs to, and what it calls. When you trigger the command, the extension calls the analyser with the highlighted function name, gets back JSON, and renders the graph instantly using **Cytoscape.js**.

**What it handles well**
- Standard function and method calls
- Calls across files and modules
- Class method attribution

**Current limitations (PoC)**
- Python only — Java, C++, and TypeScript support planned
- Dynamic calls (functions stored in variables and called later) are not tracked
- External library calls are shown as leaf nodes only

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Editor integration | VS Code Extension API (TypeScript) |
| Code parsing | Tree-sitter (Python) |
| Graph rendering | Cytoscape.js (HTML + JavaScript) |
| Glue layer | TypeScript calls Python as a subprocess |

---

## Project structure

```
CodeFlow/
├── src/
│   ├── extension.ts      # VS Code entry point, command registration
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
