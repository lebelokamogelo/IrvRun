"use strict"
import { exec } from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as vscode from "vscode"
import { DIRECTIVES } from "./directives"
import { INSTRUCTIONS, MNEMONICS } from "./instructions"
import { IRVINE32_PROCS } from "./irvine32"
import { REGISTERS } from "./registers"
import { parseSymbols, stripComment } from "./symbols"

let runTerminal: vscode.Terminal | undefined
let output: vscode.OutputChannel
let diagnostics: vscode.DiagnosticCollection
let lintDiagnostics: vscode.DiagnosticCollection
let lintTimer: ReturnType<typeof setTimeout> | undefined
let extensionPath = ""

const DEFAULT_MASM_PATH = "C:\\Masm615"

const PROGRAM_TEMPLATE = [
  "INCLUDE Irvine32.inc",
  "",
  ".data",
  '    msg BYTE "Hello, World!", 0',
  "",
  ".code",
  "main PROC",
  "    mov edx, OFFSET msg",
  "    call WriteString",
  "    call Crlf",
  "    exit",
  "main ENDP",
  "",
  "END main",
  "",
].join("\n")

function getMasmPath(): string {
  const configured = vscode.workspace
    .getConfiguration("irvrun")
    .get<string>("masmPath")
  return (configured && configured.trim()) || DEFAULT_MASM_PATH
}

function resolveAsmFile(fileUri?: vscode.Uri): vscode.Uri | undefined {
  const file = fileUri || vscode.window.activeTextEditor?.document.uri
  if (!file) {
    vscode.window.showErrorMessage("IrvRun: No assembly file selected.")
    return undefined
  }
  if (path.extname(file.fsPath).toLowerCase() !== ".asm") {
    vscode.window.showErrorMessage("IrvRun: The selected file is not a .asm file.")
    return undefined
  }
  return file
}

async function saveIfOpen(filePath: string): Promise<void> {
  const doc = vscode.workspace.textDocuments.find(
    (d) => d.uri.fsPath === filePath && d.isDirty
  )
  if (doc) {
    await doc.save()
  }
}

function getTerminal(): vscode.Terminal {
  if (!runTerminal) {
    runTerminal = vscode.window.createTerminal({
      name: "IrvRun",
      shellPath: "C:\\Windows\\System32\\cmd.exe",
    })
  }
  return runTerminal
}

function reportDiagnostics(fileUri: vscode.Uri, buildOutput: string): boolean {
  diagnostics.delete(fileUri)
  const items: vscode.Diagnostic[] = []
  let hasError = false

  const lineRe = /^(.*?)\((\d+)\)\s*:\s*(error|warning)\s+([A-Za-z]\d+)\s*:\s*(.*)$/gim
  let m: RegExpExecArray | null
  while ((m = lineRe.exec(buildOutput)) !== null) {
    const line = Math.max(0, parseInt(m[2], 10) - 1)
    const isError = m[3].toLowerCase() === "error"
    hasError = hasError || isError
    const diag = new vscode.Diagnostic(
      new vscode.Range(line, 0, line, Number.MAX_SAFE_INTEGER),
      `${m[4]}: ${m[5]}`.trim(),
      isError ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
    )
    diag.source = "IrvRun"
    items.push(diag)
  }

  const linkRe = /^(LINK|LNK).*error.*$/gim
  while ((m = linkRe.exec(buildOutput)) !== null) {
    hasError = true
    const diag = new vscode.Diagnostic(
      new vscode.Range(0, 0, 0, Number.MAX_SAFE_INTEGER),
      m[0].trim(),
      vscode.DiagnosticSeverity.Error
    )
    diag.source = "IrvRun"
    items.push(diag)
  }

  diagnostics.set(fileUri, items)
  return hasError
}

function runProc(
  command: string,
  opts: { cwd: string; env: { [key: string]: string | undefined } }
): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    exec(command, { ...opts, timeout: 60000 }, (err: any, stdout, stderr) => {
      const code = err ? (typeof err.code === "number" ? err.code : 1) : 0
      resolve({ code, output: `${stdout || ""}${stderr || ""}` })
    })
  })
}

async function build(fileUri: vscode.Uri): Promise<boolean> {
  const filePath = fileUri.fsPath
  const dir = path.dirname(filePath)
  const name = path.basename(filePath, ".asm")
  const masmPath = getMasmPath()
  const env: { [key: string]: string | undefined } = {
    ...process.env,
    PATH: `${masmPath};${process.env.PATH || ""}`,
    INCLUDE: path.join(masmPath, "INCLUDE"),
    LIB: path.join(masmPath, "LIB"),
  }
  const opts = { cwd: dir, env }
  const ml = path.join(masmPath, "ML.EXE")
  const link = path.join(masmPath, "LINK32.EXE")

  output.clear()
  if (!fs.existsSync(ml) || !fs.existsSync(link)) {
    output.appendLine(`> MASM tools not found in ${masmPath}`)
    output.appendLine("> Set 'irvrun.masmPath' or run 'IrvRun: Check Setup'.")
    output.show(true)
    vscode.window.showErrorMessage(
      `IrvRun: MASM not found in ${masmPath}. Run 'IrvRun: Check Setup'.`
    )
    return false
  }

  // A previous run may still be holding the .exe, which blocks the linker.
  // Terminate any leftover instance before rebuilding (harmless if none).
  await runProc(`taskkill /F /IM "${name}.exe"`, opts)

  output.appendLine(`> Assembling ${name}.asm`)
  const asm = await runProc(
    `"${ml}" /nologo -Zi -c -Fl -Sg -coff "${name}.asm"`,
    opts
  )
  output.append(asm.output)

  if (asm.code !== 0) {
    reportDiagnostics(fileUri, asm.output)
    output.appendLine("\n> Assembly failed.")
    return false
  }

  output.appendLine(`> Linking ${name}.obj`)
  const lnk = await runProc(
    `"${link}" /nologo "${name}.obj" irvine32.lib kernel32.lib /SUBSYSTEM:CONSOLE /DEBUG /MAP`,
    opts
  )
  output.append(lnk.output)
  reportDiagnostics(fileUri, `${asm.output}\n${lnk.output}`)

  const ok = lnk.code === 0
  output.appendLine(ok ? "\n> Build succeeded." : "\n> Build failed.")
  return ok
}

function runExecutable(fileUri: vscode.Uri): void {
  const dir = path.dirname(fileUri.fsPath)
  const name = path.basename(fileUri.fsPath, ".asm")
  const pause = vscode.workspace
    .getConfiguration("irvrun")
    .get<boolean>("pauseAfterRun", true)
  const terminal = getTerminal()
  terminal.show()
  terminal.sendText("")
  terminal.sendText("cls")
  terminal.sendText(`cd /d "${dir}"`)
  terminal.sendText(pause ? `"${name}" & pause` : `"${name}"`)
}

async function runCommand(fileUri?: vscode.Uri): Promise<void> {
  const file = resolveAsmFile(fileUri)
  if (!file) {
    return
  }
  await saveIfOpen(file.fsPath)
  const ok = await build(file)
  if (ok) {
    runExecutable(file)
  } else {
    output.show(true)
    vscode.window.showErrorMessage("IrvRun: Build failed. See the Problems panel.")
  }
}

async function buildCommand(fileUri?: vscode.Uri): Promise<void> {
  const file = resolveAsmFile(fileUri)
  if (!file) {
    return
  }
  await saveIfOpen(file.fsPath)
  const ok = await build(file)
  output.show(true)
  if (ok) {
    vscode.window.showInformationMessage("IrvRun: Build succeeded.")
  } else {
    vscode.window.showErrorMessage("IrvRun: Build failed. See the Problems panel.")
  }
}

function cleanCommand(fileUri?: vscode.Uri): void {
  const file = resolveAsmFile(fileUri)
  if (!file) {
    return
  }
  const dir = path.dirname(file.fsPath)
  const name = path.basename(file.fsPath, ".asm")
  let removed = 0
  const locked: string[] = []
  for (const ext of [".obj", ".exe", ".pdb", ".ilk", ".map", ".lst"]) {
    const target = path.join(dir, name + ext)
    if (!fs.existsSync(target)) {
      continue
    }
    try {
      fs.unlinkSync(target)
      removed++
    } catch (e) {
      locked.push(name + ext)
    }
  }
  if (locked.length > 0) {
    vscode.window.showWarningMessage(
      `IrvRun: Removed ${removed} file(s); could not delete ${locked.join(", ")} (in use?).`
    )
  } else {
    vscode.window.showInformationMessage(
      `IrvRun: Cleaned ${removed} build file${removed === 1 ? "" : "s"} for ${name}.`
    )
  }
}

function checkSetupCommand(): void {
  const masmPath = getMasmPath()
  output.clear()
  output.appendLine("IrvRun setup check")
  output.appendLine("==================")
  output.appendLine(`MASM path: ${masmPath}`)

  const problems: string[] = []
  if (!fs.existsSync(masmPath)) {
    problems.push(`Folder not found: ${masmPath}`)
  } else {
    const required: [string, string][] = [
      ["ML.EXE", masmPath],
      ["LINK32.EXE", masmPath],
      ["Irvine32.inc", path.join(masmPath, "INCLUDE")],
      ["Irvine32.lib", path.join(masmPath, "LIB")],
    ]
    for (const [file, folder] of required) {
      const found = fs.existsSync(path.join(folder, file))
      output.appendLine(`  ${found ? "[ok]" : "[missing]"} ${path.join(folder, file)}`)
      if (!found) {
        problems.push(`${file} not found in ${folder}`)
      }
    }
  }

  output.show(true)
  if (problems.length === 0) {
    vscode.window.showInformationMessage("IrvRun: Setup looks good.")
  } else {
    vscode.window.showWarningMessage(
      `IrvRun: ${problems.length} setup issue(s) found. See the output for details.`
    )
  }
}

async function newFileCommand(): Promise<void> {
  const doc = await vscode.workspace.openTextDocument({
    language: "asm",
    content: PROGRAM_TEMPLATE,
  })
  await vscode.window.showTextDocument(doc)
}

interface GameItem extends vscode.QuickPickItem {
  file: string
}

// Let the user pick a bundled showcase game and drop its source into the
// active file, replacing whatever is there.
async function insertGameCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showErrorMessage("IrvRun: Open a file first, then insert a game.")
    return
  }
  const games: GameItem[] = [
    {
      label: "Snake",
      description: "Grow by eating, avoid the walls and your own tail",
      file: "snake.asm",
    },
    {
      label: "Tic-Tac-Toe",
      description: "Play X against a smart computer opponent",
      file: "tictactoe.asm",
    },
  ]
  const pick = await vscode.window.showQuickPick(games, {
    placeHolder: "Choose a game to insert (this replaces the current file)",
  })
  if (!pick) {
    return
  }
  const gamePath = path.join(extensionPath, "games", pick.file)
  let code: string
  try {
    code = fs.readFileSync(gamePath, "utf8")
  } catch (e) {
    vscode.window.showErrorMessage(`IrvRun: Could not read ${pick.file}.`)
    return
  }
  const doc = editor.document
  const fullRange = new vscode.Range(
    doc.positionAt(0),
    doc.positionAt(doc.getText().length)
  )
  await editor.edit((builder) => builder.replace(fullRange, code))
}

function lintDocument(document: vscode.TextDocument): void {
  if (document.languageId !== "asm") {
    return
  }
  const items: vscode.Diagnostic[] = []
  const text = document.getText()
  const hasCode = /^\s*\.code\b/im.test(text) || /\bPROC\b/i.test(text)

  if (hasCode && !/INCLUDE\s+Irvine32\.inc/i.test(text)) {
    items.push(
      new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, Number.MAX_SAFE_INTEGER),
        "Missing 'INCLUDE Irvine32.inc'. Irvine32 procedures will not be found without it.",
        vscode.DiagnosticSeverity.Warning
      )
    )
  }

  if (hasCode && !/^\s*END\b/im.test(text)) {
    const last = Math.max(0, document.lineCount - 1)
    items.push(
      new vscode.Diagnostic(
        new vscode.Range(last, 0, last, Number.MAX_SAFE_INTEGER),
        "Missing 'END' directive at the end of the program.",
        vscode.DiagnosticSeverity.Warning
      )
    )
  }

  for (const d of items) {
    d.source = "IrvRun"
  }
  lintDiagnostics.set(document.uri, items)
}

function scheduleLint(document: vscode.TextDocument): void {
  if (lintTimer) {
    clearTimeout(lintTimer)
  }
  lintTimer = setTimeout(() => lintDocument(document), 400)
}

function updateStatusBar(item: vscode.StatusBarItem): void {
  const editor = vscode.window.activeTextEditor
  if (editor && path.extname(editor.document.uri.fsPath).toLowerCase() === ".asm") {
    item.show()
  } else {
    item.hide()
  }
}

// Finds every mention of a symbol outside comments. MASM identifiers may
// contain @, $ and ?, so word boundaries are spelled out by hand.
function findOccurrences(document: vscode.TextDocument, word: string): vscode.Range[] {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`(?<![\\w@$?])${escaped}(?![\\w@$?])`, "gi")
  const ranges: vscode.Range[] = []
  for (let i = 0; i < document.lineCount; i++) {
    const text = stripComment(document.lineAt(i).text)
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      ranges.push(new vscode.Range(i, m.index, i, m.index + m[0].length))
    }
  }
  return ranges
}

function computeFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
  const procRe = /^\s*[A-Za-z_@$?][\w@$?]*\s+PROC\b/i
  const endpRe = /^\s*[A-Za-z_@$?][\w@$?]*\s+ENDP\b/i
  const ranges: vscode.FoldingRange[] = []
  const open: number[] = []

  for (let i = 0; i < document.lineCount; i++) {
    const text = stripComment(document.lineAt(i).text)
    if (procRe.test(text)) {
      open.push(i)
    } else if (endpRe.test(text)) {
      const start = open.pop()
      if (start !== undefined && i > start) {
        ranges.push(new vscode.FoldingRange(start, i))
      }
    }
  }
  return ranges
}

function procMarkdown(summary: string, receives: string, returns: string): vscode.MarkdownString {
  const md = new vscode.MarkdownString()
  md.appendMarkdown(`${summary}\n\n`)
  md.appendMarkdown(`**Receives:** ${receives}\n\n`)
  md.appendMarkdown(`**Returns:** ${returns}`)
  return md
}

function formatDocument(document: vscode.TextDocument): vscode.TextEdit[] {
  const edits: vscode.TextEdit[] = []
  const directiveCol0 =
    /^(INCLUDE|INCLUDELIB|END|OPTION|TITLE|SUBTITLE|COMMENT|PUBLIC|EXTERN|EXTERNDEF|PROTO)\b/i
  const procRe = /^([A-Za-z_@$?][\w@$?]*)\s+PROC\b/i
  const endpRe = /^([A-Za-z_@$?][\w@$?]*)\s+ENDP\b/i
  const dataRe = /^([A-Za-z_@$?][\w@$?]*)\s+(BYTE|SBYTE|WORD|SWORD|DWORD|SDWORD|QWORD|TBYTE|REAL4|REAL8|REAL10|FWORD|DB|DW|DD|DQ|DT)\b/i
  const constRe = /^([A-Za-z_@$?][\w@$?]*)\s+(EQU|=)\s/i
  const labelRe = /^([A-Za-z_@$?][\w@$?]*)\s*:(?!=)/

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i)
    const raw = line.text
    const trimmed = raw.trim()

    if (trimmed === "") {
      if (raw !== "") {
        edits.push(vscode.TextEdit.replace(line.range, ""))
      }
      continue
    }

    const dataMatch = dataRe.exec(trimmed)
    const isCol0 =
      trimmed.startsWith(".") ||
      trimmed.startsWith(";") ||
      directiveCol0.test(trimmed) ||
      procRe.test(trimmed) ||
      endpRe.test(trimmed) ||
      (dataMatch !== null && !MNEMONICS.has(dataMatch[1].toLowerCase())) ||
      constRe.test(trimmed) ||
      labelRe.test(trimmed)

    const indent = isCol0 ? "" : "    "
    const formatted = indent + trimmed
    if (formatted !== raw) {
      edits.push(vscode.TextEdit.replace(line.range, formatted))
    }
  }
  return edits
}

function buildCheatSheetHtml(): string {
  const procRows = IRVINE32_PROCS.map(
    (p) =>
      `<tr><td><code>${p.name}</code></td><td>${p.summary}</td><td>${p.receives}</td><td>${p.returns}</td></tr>`
  ).join("")
  const categories: string[] = []
  for (const i of INSTRUCTIONS) {
    if (!categories.includes(i.category)) {
      categories.push(i.category)
    }
  }
  const insRows = categories
    .map((category) => {
      const rows = INSTRUCTIONS.filter((i) => i.category === category)
        .map((i) => `<tr><td><code>${i.name}</code></td><td>${i.summary}</td></tr>`)
        .join("")
      return `<tr><th colspan="2">${category}</th></tr>${rows}`
    })
    .join("")

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: var(--vscode-font-family); padding: 1rem; color: var(--vscode-foreground); }
  h1 { font-size: 1.4rem; }
  h2 { margin-top: 1.6rem; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: .3rem; }
  table { border-collapse: collapse; width: 100%; margin-top: .5rem; }
  th, td { text-align: left; padding: .35rem .6rem; border-bottom: 1px solid var(--vscode-panel-border); vertical-align: top; }
  th { color: var(--vscode-textLink-foreground); }
  code { background: var(--vscode-textCodeBlock-background); padding: 0 .3rem; border-radius: 3px; }
  ul { line-height: 1.7; }
</style>
</head>
<body>
  <h1>IrvRun Cheat Sheet</h1>

  <h2>Register conventions</h2>
  <ul>
    <li><code>EAX</code> is the main accumulator and holds most return values.</li>
    <li><code>EDX</code> usually holds the offset of a string for I/O procedures.</li>
    <li><code>ECX</code> is the counter used by <code>loop</code>.</li>
    <li><code>ESI</code> / <code>EDI</code> are source and destination index registers.</li>
    <li><code>ESP</code> is the stack pointer; <code>EBP</code> is the base pointer.</li>
  </ul>

  <h2>Irvine32 procedures</h2>
  <table>
    <tr><th>Procedure</th><th>Description</th><th>Receives</th><th>Returns</th></tr>
    ${procRows}
  </table>

  <h2>Common instructions</h2>
  <table>
    <tr><th>Instruction</th><th>Description</th></tr>
    ${insRows}
  </table>
</body>
</html>`
}

function cheatSheetCommand(): void {
  const panel = vscode.window.createWebviewPanel(
    "irvrunCheatSheet",
    "IrvRun Cheat Sheet",
    vscode.ViewColumn.Beside,
    {}
  )
  panel.webview.html = buildCheatSheetHtml()
}

export function activate(context: vscode.ExtensionContext) {
  extensionPath = context.extensionPath
  output = vscode.window.createOutputChannel("IrvRun")
  diagnostics = vscode.languages.createDiagnosticCollection("irvrun")
  lintDiagnostics = vscode.languages.createDiagnosticCollection("irvrun-lint")

  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  )
  statusBar.text = "$(play) Run MASM"
  statusBar.tooltip = "Build and run this .asm file with IrvRun"
  statusBar.command = "irvrun.run"
  updateStatusBar(statusBar)

  const hover = vscode.languages.registerHoverProvider("asm", {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position, /[A-Za-z_@$?][\w@$?]*/)
      if (!range) {
        return undefined
      }
      const word = document.getText(range).toLowerCase()
      const proc = IRVINE32_PROCS.find((p) => p.name.toLowerCase() === word)
      if (proc) {
        const md = procMarkdown(proc.summary, proc.receives, proc.returns)
        md.value = `**${proc.name}** *(Irvine32)*\n\n` + md.value
        return new vscode.Hover(md, range)
      }
      const ins = INSTRUCTIONS.find((i) => i.name.toLowerCase() === word)
      if (ins) {
        const md = new vscode.MarkdownString(`**${ins.name}** *(instruction)*\n\n${ins.summary}`)
        return new vscode.Hover(md, range)
      }
      // A directive such as .data is written with a leading dot, which the word
      // range never includes, so try the dotted spelling too.
      const dotted = range.start.character > 0 &&
        document.getText(
          new vscode.Range(range.start.translate(0, -1), range.start)
        ) === "."
      const dir = DIRECTIVES.find(
        (d) => d.name.toLowerCase() === (dotted ? "." + word : word)
      )
      if (dir) {
        const md = new vscode.MarkdownString(`**${dir.name}** *(directive)*\n\n${dir.summary}`)
        return new vscode.Hover(md, range)
      }
      const reg = REGISTERS.find((r) => r.name.toLowerCase() === word)
      if (reg) {
        const md = new vscode.MarkdownString(
          `**${reg.name}** *(${reg.size} register)*\n\n${reg.summary}`
        )
        return new vscode.Hover(md, range)
      }
      return undefined
    },
  })

  const completion = vscode.languages.registerCompletionItemProvider("asm", {
    provideCompletionItems(document) {
      const items: vscode.CompletionItem[] = []
      const taken = new Set<string>()

      for (const proc of IRVINE32_PROCS) {
        const item = new vscode.CompletionItem(proc.name, vscode.CompletionItemKind.Function)
        item.detail = "Irvine32 procedure"
        item.documentation = procMarkdown(proc.summary, proc.receives, proc.returns)
        items.push(item)
        taken.add(proc.name.toLowerCase())
      }
      for (const ins of INSTRUCTIONS) {
        const item = new vscode.CompletionItem(ins.name, vscode.CompletionItemKind.Keyword)
        item.detail = "x86 instruction"
        item.documentation = new vscode.MarkdownString(ins.summary)
        items.push(item)
        taken.add(ins.name.toLowerCase())
      }
      for (const reg of REGISTERS) {
        const item = new vscode.CompletionItem(reg.name, vscode.CompletionItemKind.Variable)
        item.detail = `${reg.size} register`
        item.documentation = new vscode.MarkdownString(reg.summary)
        items.push(item)
        taken.add(reg.name.toLowerCase())
      }
      for (const dir of DIRECTIVES) {
        const item = new vscode.CompletionItem(dir.name, vscode.CompletionItemKind.Keyword)
        item.detail = "directive"
        item.documentation = new vscode.MarkdownString(dir.summary)
        items.push(item)
        taken.add(dir.name.toLowerCase())
      }
      for (const sym of parseSymbols(document)) {
        if (taken.has(sym.name.toLowerCase())) {
          continue
        }
        taken.add(sym.name.toLowerCase())
        const item = new vscode.CompletionItem(sym.name, vscode.CompletionItemKind.Reference)
        item.detail = sym.detail
        items.push(item)
      }
      return items
    },
  })

  const signatures = vscode.languages.registerSignatureHelpProvider(
    "asm",
    {
      provideSignatureHelp(document, position) {
        const line = document.lineAt(position.line).text.substring(0, position.character)
        const m = /\bcall\s+([A-Za-z_@$?][\w@$?]*)?$/i.exec(line)
        if (!m) {
          return undefined
        }
        const name = (m[1] || "").toLowerCase()
        const proc = IRVINE32_PROCS.find((p) => p.name.toLowerCase() === name)
        if (!proc) {
          return undefined
        }
        const info = new vscode.SignatureInformation(
          `call ${proc.name}`,
          procMarkdown(proc.summary, proc.receives, proc.returns)
        )
        const help = new vscode.SignatureHelp()
        help.signatures = [info]
        help.activeSignature = 0
        help.activeParameter = 0
        return help
      },
    },
    " "
  )

  const symbolProvider = vscode.languages.registerDocumentSymbolProvider("asm", {
    provideDocumentSymbols(document) {
      return parseSymbols(document).map((s) => {
        const range = new vscode.Range(
          s.line,
          s.character,
          s.line,
          s.character + s.name.length
        )
        return new vscode.DocumentSymbol(s.name, s.detail, s.kind, range, range)
      })
    },
  })

  const definitionProvider = vscode.languages.registerDefinitionProvider("asm", {
    provideDefinition(document, position) {
      const range = document.getWordRangeAtPosition(position, /[A-Za-z_@$?][\w@$?]*/)
      if (!range) {
        return undefined
      }
      const word = document.getText(range).toLowerCase()
      const sym = parseSymbols(document).find((s) => s.name.toLowerCase() === word)
      if (!sym) {
        return undefined
      }
      return new vscode.Location(document.uri, new vscode.Position(sym.line, sym.character))
    },
  })

  const folding = vscode.languages.registerFoldingRangeProvider("asm", {
    provideFoldingRanges(document) {
      return computeFoldingRanges(document)
    },
  })

  const highlights = vscode.languages.registerDocumentHighlightProvider("asm", {
    provideDocumentHighlights(document, position) {
      const range = document.getWordRangeAtPosition(position, /[A-Za-z_@$?][\w@$?]*/)
      if (!range) {
        return undefined
      }
      const word = document.getText(range)
      if (MNEMONICS.has(word.toLowerCase())) {
        return undefined
      }
      return findOccurrences(document, word).map((r) => new vscode.DocumentHighlight(r))
    },
  })

  const formatter = vscode.languages.registerDocumentFormattingEditProvider("asm", {
    provideDocumentFormattingEdits(document) {
      return formatDocument(document)
    },
  })

  vscode.workspace.textDocuments.forEach(lintDocument)

  context.subscriptions.push(
    output,
    diagnostics,
    lintDiagnostics,
    statusBar,
    hover,
    completion,
    signatures,
    symbolProvider,
    definitionProvider,
    folding,
    highlights,
    formatter,
    vscode.commands.registerCommand("irvrun.run", runCommand),
    vscode.commands.registerCommand("irvrun.build", buildCommand),
    vscode.commands.registerCommand("irvrun.clean", cleanCommand),
    vscode.commands.registerCommand("irvrun.checkSetup", checkSetupCommand),
    vscode.commands.registerCommand("irvrun.newFile", newFileCommand),
    vscode.commands.registerCommand("irvrun.insertGame", insertGameCommand),
    vscode.commands.registerCommand("irvrun.cheatSheet", cheatSheetCommand),
    vscode.window.onDidChangeActiveTextEditor(() => updateStatusBar(statusBar)),
    vscode.workspace.onDidOpenTextDocument(lintDocument),
    vscode.workspace.onDidChangeTextDocument((e) => scheduleLint(e.document)),
    vscode.workspace.onDidCloseTextDocument((d) => lintDiagnostics.delete(d.uri)),
    vscode.window.onDidCloseTerminal((t) => {
      if (t === runTerminal) {
        runTerminal = undefined
      }
    })
  )
}

export function deactivate() {}
