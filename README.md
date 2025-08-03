# **IrvRun**

**IrvRun** is a lightweight Visual Studio Code extension that lets you run MASM32 Assembly code using **Irvine32** with a single click. It streamlines the workflow for writing, building, and executing `.asm` files — making Irvine32 development fast, clean, and beginner-friendly with no manual setup required.

---

## Developers

- **Kamogelo Lebelo**
- **Budeli Thabelo**

---

## Features

- **One-click run**: Instantly build and execute `.asm` files from the editor.
- **Automatic build & run**: Uses `make32` to compile and run programs.
- **Enhanced syntax highlighting**: Tailored for Irvine32-style MASM code.
- **Built-in snippets**: Insert frequently used patterns with a shortcut.
- **Run from file explorer or editor**: Supports running files from both locations.
- **Integrated terminal output**: See build and runtime output in the VS Code terminal.

---

## Installation Requirements

### Step 1: Download MASM615

- Download MASM615 from the official bundle link:
  [MASM615.zip](https://www.mediafire.com/file/kxd98uu0lf4brpj/Masm615.zip/file)

- Extract the contents directly to your **C drive**, so the path becomes:

  ```
  C:\Masm615
  ```

> **Do not rename or relocate the folder.** IrvRun expects MASM615 to be located exactly at `C:\Masm615`.

---

### Step 2: Set the PATH Environment Variable

To allow your system (and VS Code) to recognize MASM tools like `ml.exe` and `link.exe`, add `C:\Masm615` to your system PATH:

1. Press <kbd>Windows</kbd> and search for **Environment Variables**.
2. Click **Edit the system environment variables**.
3. In the **System Properties** window, click **Environment Variables…**
4. Under **System variables**, select the `Path` variable and click **Edit**.
5. Click **New**, then add:

   ```
   C:\Masm615
   ```

6. Click **OK** to save all changes.

> ✅ After this, your system will be able to run MASM tools globally from any terminal or VS Code instance.

---

### Step 3: Install IrvRun Extension

1. Open **Visual Studio Code**.
2. Press <kbd>Ctrl+Shift+X</kbd> to open the Extensions view.
3. Search for `IrvRun` and click **Install**.

Once installed, you can run `.asm` files directly from the editor or right-click in the file explorer.

---

## Code Snippets

Use these helpful Irvine32 snippets by typing the prefix and pressing <kbd>Tab</kbd>:

| Prefix     | Description                            |
| ---------- | -------------------------------------- |
| `skeleton` | Basic MASM program with Irvine32 setup |
| `writes`   | Print a string using `WriteString`     |
| `writei`   | Print an integer using `WriteInt`      |
| `readi`    | Read an integer using `ReadInt`        |
| `exit`     | Exit the program cleanly               |

---

## Notes

- Make sure `ml.exe`, `link.exe`, `Irvine32.lib`, and other required files exist in the correct subfolders inside `C:\Masm615`.
- Only 32-bit MASM and Irvine32 are supported.
- If you see errors like "command not found" or "linker not found", double-check your PATH setup.
- Restart VS Code after editing environment variables to ensure changes are picked up.

---

## Troubleshooting

| Issue                         | Solution                                                         |
| ----------------------------- | ---------------------------------------------------------------- |
| `ml` or `link` not recognized | Ensure `C:\Masm615` is correctly added to the system PATH.       |
| Build fails with `.lib` error | Confirm `Irvine32.lib` is present in `C:\Masm615\LIB`.           |
| No output in terminal         | Check that the Run action is executing the expected `.exe` file. |
