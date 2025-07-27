"use strict"

export interface Directive {
  name: string
  summary: string
}

export const DIRECTIVES: Directive[] = [
  { name: ".386", summary: "Enables the 32-bit instruction set. Irvine32.inc sets this for you." },
  { name: ".model", summary: "Selects the memory model and calling convention, for example `.model flat, stdcall`." },
  { name: ".stack", summary: "Reserves runtime stack space, for example `.stack 4096`." },
  { name: ".data", summary: "Starts the initialised data segment, where variables are declared." },
  { name: ".data?", summary: "Starts the uninitialised data segment, for variables declared with `?`." },
  { name: ".const", summary: "Starts the read-only constant segment." },
  { name: ".code", summary: "Starts the code segment, where procedures are written." },
  { name: "INCLUDE", summary: "Copies another source file into this one. `INCLUDE Irvine32.inc`" },
  { name: "INCLUDELIB", summary: "Names a library for the linker to search." },
  { name: "PROC", summary: "Begins a procedure. `main PROC`" },
  { name: "ENDP", summary: "Ends a procedure. The name must match the matching PROC." },
  { name: "END", summary: "Ends the source file and names the entry point. `END main`" },
  { name: "PROTO", summary: "Declares a procedure prototype so it can be called with INVOKE." },
  { name: "INVOKE", summary: "Calls a procedure, pushing the arguments for you." },
  { name: "PUBLIC", summary: "Makes a symbol visible to other modules." },
  { name: "EXTERN", summary: "Declares a symbol that is defined in another module." },
  { name: "EQU", summary: "Defines a symbolic constant that cannot be reassigned." },
  { name: "TEXTEQU", summary: "Defines a text macro." },
  { name: "DUP", summary: "Repeats a data value. `array DWORD 10 DUP(0)`" },
  { name: "OFFSET", summary: "Returns the address of a variable. `mov edx, OFFSET msg`" },
  { name: "PTR", summary: "Overrides the declared size of an operand. `mov al, BYTE PTR value`" },
  { name: "TYPE", summary: "Returns the size in bytes of one element of a variable." },
  { name: "LENGTHOF", summary: "Returns the number of elements in an array." },
  { name: "SIZEOF", summary: "Returns the total size of a variable in bytes (TYPE times LENGTHOF)." },
  { name: "ALIGN", summary: "Aligns the next variable or instruction on a byte boundary." },
  { name: "ORG", summary: "Sets the location counter to a given offset." },
  { name: "MACRO", summary: "Begins a macro definition." },
  { name: "ENDM", summary: "Ends a macro definition." },
  { name: "STRUCT", summary: "Begins a structure definition." },
  { name: "ENDS", summary: "Ends a structure or segment definition." },
  { name: "BYTE", summary: "Declares an 8-bit unsigned variable." },
  { name: "SBYTE", summary: "Declares an 8-bit signed variable." },
  { name: "WORD", summary: "Declares a 16-bit unsigned variable." },
  { name: "SWORD", summary: "Declares a 16-bit signed variable." },
  { name: "DWORD", summary: "Declares a 32-bit unsigned variable." },
  { name: "SDWORD", summary: "Declares a 32-bit signed variable." },
  { name: "QWORD", summary: "Declares a 64-bit variable." },
  { name: "TBYTE", summary: "Declares an 80-bit variable." },
  { name: "REAL4", summary: "Declares a 32-bit floating point variable." },
  { name: "REAL8", summary: "Declares a 64-bit floating point variable." },
  { name: "REAL10", summary: "Declares an 80-bit floating point variable." },
]

export const DIRECTIVE_NAMES: Set<string> = new Set(DIRECTIVES.map((d) => d.name.toLowerCase()))
