# IrvRun

IrvRun is a Visual Studio Code extension that builds and runs MASM32 Assembly programs written with the Irvine32 library. It compiles and launches your `.asm` file in one click, turning a multi-step build into a single action.

## Features

- Build and run `.asm` files with a single click.
- Build errors and warnings shown in the Problems panel, linked to the exact line.
- Hover help and autocomplete for Irvine32 procedures and x86 instructions.
- Outline, breadcrumbs, and Go to Definition for your own labels, procedures, and variables.
- Syntax highlighting, comment toggling, bracket matching, and auto-indent.
- Snippets for common patterns and a built-in cheat sheet.

## Installation

**1. Download MASM615**

Download MASM615 and extract it so the tools sit directly in `C:\Masm615`.

**2. Install the extension**

In VS Code, open the Extensions view (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>), search for `IrvRun`, and click **Install**.

**3. Confirm the setup**

Run **IrvRun: Check Setup** from the Command Palette. If your MASM615 is somewhere other than `C:\Masm615`, set the `irvrun.masmPath` setting to point to it. You do not need to edit your system PATH.

## Usage

Open an `.asm` file and run it with any of these:

- Press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>N</kbd>.
- Click the **Run MASM** button in the status bar or the title bar.
- Right-click the file and choose **Run MASM Code**.

## Commands

Available from the Command Palette (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>):

| Command                 | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `IrvRun: Run MASM Code` | Build and run the current file.                   |
| `IrvRun: Build MASM Code` | Build without running, reporting any errors.     |
| `IrvRun: Clean Build Files` | Delete generated files (`.obj`, `.exe`, etc.). |
| `IrvRun: New Program`   | Create a new file from the Irvine32 template.      |
| `IrvRun: Check Setup`   | Verify your MASM615 installation and PATH.         |
| `IrvRun: Open Cheat Sheet` | Show register conventions, procedures, and instructions. |

## Settings

| Setting                | Default       | Description                                      |
| ---------------------- | ------------- | ------------------------------------------------ |
| `irvrun.masmPath`      | `C:\Masm615`  | Path to your MASM615 installation.               |
| `irvrun.pauseAfterRun` | `true`        | Keep the console open after the program finishes. |

## Snippets

Type a prefix and press <kbd>Tab</kbd>:

| Prefix     | Description                          |
| ---------- | ------------------------------------ |
| `template` | Basic Irvine32 program template      |
| `writes`   | Print a string with `WriteString`    |
| `writei`   | Print an integer with `WriteInt`     |
| `readi`    | Read an integer with `ReadInt`       |
| `proc`     | Define a procedure                   |
| `loop`     | Loop using `ECX`                     |
| `ifelse`   | Compare and branch with `CMP`        |
| `data`     | Declare a variable in `.data`        |
| `cls`      | Clear the screen                     |
| `crlf`     | Print a new line                     |
| `datetime` | Get the system date and time         |
| `rand`     | Generate a random number             |
| `exit`     | Exit the program cleanly             |

## Notes

Windows only. Supports 32-bit MASM and Irvine32. If a build fails to find the tools, run **IrvRun: Check Setup** and confirm `irvrun.masmPath` points to your MASM615 folder.

## Developers

Kamogelo Lebelo and Budeli Thabelo
