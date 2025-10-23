# Contributing to IrvRun

Thanks for taking the time to help. IrvRun is small, so almost any change is easy to review.

## Getting set up

```
git clone https://github.com/lebelokamogelo/IrvRun.git
cd IrvRun
npm install
```

Press <kbd>F5</kbd> in VS Code to launch the **Launch Extension** configuration. That compiles the TypeScript and opens a second VS Code window with IrvRun loaded, so you can open an `.asm` file and try your change straight away.

`npm run compile` starts the TypeScript compiler in watch mode if you would rather keep it running in a terminal.

## Where things live

| Path | What it holds |
| ---- | ------------- |
| `src/extension.ts` | Commands, the build pipeline, and every language provider |
| `src/instructions.ts` | The x86 instruction reference used by hover, completion, and the cheat sheet |
| `src/irvine32.ts` | The Irvine32 procedure reference |
| `src/registers.ts`, `src/directives.ts` | Register and directive reference data |
| `src/symbols.ts` | Parsing labels, variables, and procedures out of a document |
| `syntaxes/masm.tmLanguage.json` | Syntax highlighting |
| `snippets.json` | Snippets |
| `games/`, `examples/` | The programs offered by Insert Game and Insert Example |

Adding an instruction, procedure, register, or directive usually means adding one entry to the matching file. Everything that reads it picks the entry up automatically.

## Before you open a pull request

- Make sure the extension compiles: `npx tsc -p ./`.
- Try the change in the extension host window, not just in the source.
- Any `.asm` you add under `examples/` should assemble and run against Irvine32 as-is.
- Keep commit messages short and in the present tense.

## Reporting a problem

Open an issue with the `.asm` file that shows the problem, the exact output from the IrvRun output panel, and your `irvrun.masmPath`. The output panel prints every command it runs, which is usually enough to spot the cause.
