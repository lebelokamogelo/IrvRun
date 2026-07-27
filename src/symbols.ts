"use strict"
import * as vscode from "vscode"
import { MNEMONICS } from "./instructions"

export interface AsmSymbol {
  name: string
  kind: vscode.SymbolKind
  detail: string
  line: number
  character: number
}

const PROC_RE = /^(\s*)([A-Za-z_@$?][\w@$?]*)\s+PROC\b/i
const DATA_RE = /^(\s*)([A-Za-z_@$?][\w@$?]*)\s+(BYTE|SBYTE|WORD|SWORD|DWORD|SDWORD|QWORD|TBYTE|REAL4|REAL8|REAL10|FWORD|DB|DW|DD|DQ|DT)\b/i
const CONST_RE = /^(\s*)([A-Za-z_@$?][\w@$?]*)\s+(EQU|=)\s/i
const LABEL_RE = /^(\s*)([A-Za-z_@$?][\w@$?]*)\s*:(?!=)/

function stripComment(text: string): string {
  const idx = text.indexOf(";")
  return idx >= 0 ? text.substring(0, idx) : text
}

export function parseSymbols(document: vscode.TextDocument): AsmSymbol[] {
  const symbols: AsmSymbol[] = []
  for (let i = 0; i < document.lineCount; i++) {
    const text = stripComment(document.lineAt(i).text)
    if (!text.trim()) {
      continue
    }
    let m: RegExpExecArray | null
    if ((m = PROC_RE.exec(text))) {
      symbols.push({ name: m[2], kind: vscode.SymbolKind.Function, detail: "procedure", line: i, character: m[1].length })
    } else if ((m = DATA_RE.exec(text)) && !MNEMONICS.has(m[2].toLowerCase())) {
      symbols.push({ name: m[2], kind: vscode.SymbolKind.Variable, detail: m[3].toUpperCase(), line: i, character: m[1].length })
    } else if ((m = CONST_RE.exec(text)) && !MNEMONICS.has(m[2].toLowerCase())) {
      symbols.push({ name: m[2], kind: vscode.SymbolKind.Constant, detail: "constant", line: i, character: m[1].length })
    } else if ((m = LABEL_RE.exec(text)) && !MNEMONICS.has(m[2].toLowerCase())) {
      symbols.push({ name: m[2], kind: vscode.SymbolKind.Method, detail: "label", line: i, character: m[1].length })
    }
  }
  return symbols
}
