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
