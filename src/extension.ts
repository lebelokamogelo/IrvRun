"use strict"
import * as path from "path"
import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
  const run = vscode.commands.registerCommand(
    "code-runner.run",
    (fileUri?: vscode.Uri) => {
      const editor = vscode.window.activeTextEditor
      const file = fileUri || editor?.document.uri

      if (!file) {
        vscode.window.showErrorMessage("No assembly file selected.")
        return
      }

      const filePath = file.fsPath
      const fileName = path.basename(filePath, ".asm")
      const fileDir = path.dirname(filePath)

      const terminal = vscode.window.createTerminal({
        name: "IrvRun",
        shellPath: "C:\\Windows\\System32\\cmd.exe",
        shellArgs: [],
      })
      terminal.show()
      terminal.sendText(`cd "${fileDir}"`)
      terminal.sendText(`make32 ${fileName} && ${fileName}`)
    }
  )

  context.subscriptions.push(run)
}

export function deactivate() {}
