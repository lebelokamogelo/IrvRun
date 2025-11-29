### 1.3.0 (2026-08-28)

Added
- Reference data for every general purpose register, assembler directive, and the rest of the x86 instruction set, wired into hover, autocomplete, and the cheat sheet.
- Signature help on `call`, occurrence highlighting, folding for procedures and segments, Rename, and Find All References.
- A Run code lens above `main` and an IrvRun build task.
- Six worked examples and an Insert Example command that drops one into the current file.
- Guess the Number showcase game.
- Warnings for a missing `exit`, an `END` label that names nothing, an unclosed `PROC`, duplicate names, jumps and calls to names that do not exist, and unused data. The first two come with quick fixes.
- `irvrun.lint`, `irvrun.showOutputOnBuild`, `irvrun.assemblerOptions`, and `irvrun.linkerOptions` settings.
- Snippets for the string library, file input and output, arrays, and jump tables.
- Contributing guide, plus troubleshooting and keyboard shortcut sections in the README.

Changed
- Stale `.obj` and `.exe` files are deleted before assembling, so a failed build can no longer link against an old object file.
- The status bar shows build progress and the output panel reports how long the build took.
- Parsed symbols are cached per document version instead of being recomputed on every request.

Fixed
- Each open file now has its own lint timer, so typing in one file no longer cancels the pending check of another.
- Corrected the `STC` and `JCXZ` mnemonics in the syntax grammar, and highlighted `ESI`, `EDI`, `EBP`, and `ESP`.

### 1.2.0 (2026-07-28)

Added
- Showcase games written in Irvine32 assembly: Snake and Tic-Tac-Toe (vs computer).
- Insert Game command that drops a complete game into the current file.

Fixed
- Re-running now closes the previous program first, so the build no longer fails when the executable is still open.

### 1.1.0 (2026-07-27)

Added
- Build, Clean, Check Setup, New Program, and Open Cheat Sheet commands.
- Errors and warnings from the build now appear in the Problems panel.
- Hover documentation and autocomplete for Irvine32 procedures and x86 instructions.
- Outline view, breadcrumbs, and Go to Definition for your own labels, procedures, and variables.
- Basic linting for missing `INCLUDE Irvine32.inc` and `END`.
- Document formatting that normalizes indentation.
- Status bar Run button and a configurable `irvrun.masmPath` setting.
- `irvrun.pauseAfterRun` setting to keep the console open after a program finishes.

Changed
- Builds now invoke `ML` and `LINK32` directly instead of `make32.bat`, so they no longer hang and no system PATH change is required.
- Files are now saved automatically before running.
- The run terminal is reused and cleared before each run so you only see the latest output.
- Comment toggling, bracket matching, and auto-indent for `.asm` files.

Removed
- Unused dependencies and stale CI/lint configuration.

### 1.0.1 (2025-09-20)
- Changed the masm615 download link as flag by mediafire.

### 1.0.0 (2025-08-03)

- Initial release of lightweight runner for MASM615 with Irvine32 support

- One-click run for .asm files in Visual Studio Code

- Automatic build & execute using ml and link

- Simple, fast, and minimal setup

- Windows-only, tested on MASM v6.15

- Irvine32 snippets: Quickly insert common code patterns with built-in snippets.
