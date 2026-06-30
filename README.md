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

1. Highlight a function name in your TypeScript file
2. Open the command palette and run `CodeFlow: Show Dependencies`
3. Two panels open alongside your editor

**Panel 1 — dependency graph.** Shows every function that calls yours (callers) and every function yours calls (callees), with the class name and file for each node. Click any node to highlight its connections.

**Panel 2 — interactive visualisation.** An AI-generated simulation of your function's behaviour using real data shapes inferred from your actual codebase. Not a static diagram — a live widget you can interact with.

The whole flow takes under 3 seconds from highlight to rendered output.

---

## Installation

**Requirements**
- VS Code 1.75 or later
- Node.js 18 or later

**Install from source (PoC)**

```bash
git clone https://github.com/stanleyctg/CodeFlow.git
cd CodeFlow/codeflow
npm install
npm run compile
```
---

## Usage

Open any TypeScript project in VS Code. Place your cursor inside or highlight any function name. Then:
Cmd+Shift+P → CodeFlow: Show Dependencies
**Reading the graph**

| Colour | Meaning |
|--------|---------|
| Purple | The function you selected |
| Green  | Callers — functions that call into it |
| Grey   | Callees — functions it calls outward |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Editor integration | VS Code Extension API (TypeScript) |
| Code parsing | Tree-sitter (TypeScript) |
| Dependency graph rendering | Cytoscape.js |
| AI visualisation | Claude API |


## Contributing

This is an early PoC. Contributions, issues, and feedback are very welcome.

---

## Licence

MIT
