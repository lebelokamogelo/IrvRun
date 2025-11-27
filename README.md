# IrvRun

IrvRun is a Visual Studio Code extension that builds and runs MASM32 Assembly programs written with the Irvine32 library. It compiles and launches your `.asm` file in one click, turning a multi-step build into a single action.

## Features

- Build and run `.asm` files with a single click.
- Build errors and warnings shown in the Problems panel, linked to the exact line.
- Hover help and autocomplete for Irvine32 procedures, x86 instructions, registers, and directives.
- Outline, breadcrumbs, Go to Definition, Find All References, and Rename for your own labels, procedures, and variables.
- Warnings for a missing `exit`, an unclosed `PROC`, duplicate names, jumps to labels that do not exist, and unused data.
- Folding for procedures and segments, signature help on `call`, and a Run code lens above `main`.
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
| `IrvRun: Insert Game`   | Drop a complete showcase game into the current file. |
| `IrvRun: Insert Example` | Drop a short worked example into the current file. |
| `IrvRun: Check Setup`   | Verify your MASM615 installation and PATH.         |
| `IrvRun: Open Cheat Sheet` | Show register conventions, procedures, and instructions. |

## Keyboard shortcuts

| Shortcut | Action |
| -------- | ------ |
| <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>N</kbd> | Build and run the current file |
| <kbd>F12</kbd> | Go to the definition of a label, variable, or procedure |
| <kbd>Shift</kbd>+<kbd>F12</kbd> | Find every reference to the name under the cursor |
| <kbd>F2</kbd> | Rename a label, variable, or procedure |
| <kbd>Ctrl</kbd>+<kbd>.</kbd> | Apply a quick fix to the warning under the cursor |
| <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>F</kbd> | Reformat the file |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> | Jump to a symbol in the file |

## Settings

| Setting                | Default       | Description                                      |
| ---------------------- | ------------- | ------------------------------------------------ |
| `irvrun.masmPath`      | `C:\Masm615`  | Path to your MASM615 installation.               |
| `irvrun.pauseAfterRun` | `true`        | Keep the console open after the program finishes. |
| `irvrun.lint`          | `true`        | Check open files for common mistakes as you type. |
| `irvrun.showOutputOnBuild` | `true`    | Reveal the output panel after a build succeeds.   |
| `irvrun.assemblerOptions` | `""`       | Extra options passed to `ML.EXE`.                 |
| `irvrun.linkerOptions` | `""`          | Extra options passed to `LINK32.EXE`.             |

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
| `reads`    | Read a line of text into a buffer    |
| `strlen`   | Length of a null-terminated string   |
| `strcpy`   | Copy a string                        |
| `strcmp`   | Compare two strings                  |
| `fcreate`  | Create a file for writing            |
| `fopen`    | Open a file for reading              |
| `fwrite`   | Write a buffer to a file             |
| `fread`    | Read a block from a file             |
| `fclose`   | Close a file                         |
| `array`    | Declare an array with `DUP`          |
| `walk`     | Walk an array with `ESI`             |
| `index`    | Read an element with a scaled index  |
| `jumptable`| Dispatch through a table of procedures |
| `procp`    | Procedure with saved registers and parameters |

## Example programs

Short, focused programs that each demonstrate one idea. Open an `.asm` file, run **IrvRun: Insert Example**, and pick one.

| Example            | Shows                                                       |
| ------------------ | ----------------------------------------------------------- |
| Fibonacci          | Input validation, `loop`, and building a series in registers |
| Bubble Sort        | Arrays, `TYPE`, nested loops, and procedures                 |
| Reverse a String   | `ReadString`, pointer arithmetic, and `WriteChar`            |
| Prime Sieve        | Indexed addressing and crossing off multiples                |
| Temperature        | Signed arithmetic with `cdq` and `idiv`                      |
| Binary Search      | Scaled indexing and a procedure with a return value          |

## Showcase games

IrvRun ships with complete, ready-to-run games written in Irvine32 assembly. They double as working examples of console I/O, keyboard input, and game loops.

**To try one:**

1. Open an `.asm` file.
2. Run **IrvRun: Insert Game** from the Command Palette and pick a game. Its full source replaces the current file, so use an empty or throwaway file.
3. Run it with <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>N</kbd>.

### Snake

Steer the snake into the food to grow and score. Hitting a wall or your own tail ends the round. Your best score is kept until you close the game.

| Key | Action |
| --- | ------ |
| Arrow keys or `W` `A` `S` `D` | Steer |
| `R` | Play again after game over |
| `Q` | Quit |

### Tic-Tac-Toe

Play against the computer. You are `X`, the computer is `O`. Empty squares show their number, so type `1`-`9` to place your mark. The computer takes any winning move, blocks yours, then prefers the center, corners, and sides, which makes it very hard to beat.

| Key | Action |
| --- | ------ |
| `1`-`9` then <kbd>Enter</kbd> | Place your mark |
| `R` | Play again |
| `Q` | Quit |

### Guess the Number

The computer picks a number from 1 to 100 and you have seven guesses to find it. Each guess is answered with "too low" or "too high", and your best round is kept until you quit.

| Key | Action |
| --- | ------ |
| `0`-`9` then <kbd>Enter</kbd> | Make a guess |
| `R` | Play again |
| `Q` | Quit |

## Troubleshooting

**"MASM not found"** — Run **IrvRun: Check Setup**. It lists exactly which of `ML.EXE`, `LINK32.EXE`, `Irvine32.inc`, and `Irvine32.lib` it could not find. Point `irvrun.masmPath` at the folder that holds `ML.EXE`.

**The build fails with a linker error about the `.exe`** — The previous run is still open. IrvRun closes it for you before each build, but if a console window is stuck, close it and run again.

**`A2006: undefined symbol`** — The file is missing `INCLUDE Irvine32.inc`, or a label is spelled differently from where it is defined. The editor underlines both cases before you build.

**Nothing happens when I press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>N</kbd>** — The shortcut only applies to files VS Code has recognised as assembly. Check that the language shown in the status bar is `Irvine32`, and that the file is saved with an `.asm` extension.

**The console closes before I can read the output** — Leave `irvrun.pauseAfterRun` on, or end your program with `call WaitMsg`.

## Developers

Kamogelo Lebelo and Budeli Thabelo
