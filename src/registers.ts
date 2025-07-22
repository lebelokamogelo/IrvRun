"use strict"

export interface Register {
  name: string
  size: string
  summary: string
}

export const REGISTERS: Register[] = [
  { name: "EAX", size: "32-bit", summary: "Accumulator. Holds the result of most arithmetic and the return value of Irvine32 procedures." },
  { name: "EBX", size: "32-bit", summary: "Base register. Often holds a base address or a table offset." },
  { name: "ECX", size: "32-bit", summary: "Counter. Used automatically by loop and by the repeat prefixes." },
  { name: "EDX", size: "32-bit", summary: "Data register. Holds the offset of a string for the Irvine32 I/O procedures, and the high half of a product or dividend." },
  { name: "ESI", size: "32-bit", summary: "Source index. Points at the source operand of the string instructions." },
  { name: "EDI", size: "32-bit", summary: "Destination index. Points at the destination operand of the string instructions." },
  { name: "EBP", size: "32-bit", summary: "Base pointer. Anchors the current stack frame so arguments and locals can be addressed." },
  { name: "ESP", size: "32-bit", summary: "Stack pointer. Points at the value on the top of the stack." },
  { name: "AX", size: "16-bit", summary: "The low 16 bits of EAX." },
  { name: "BX", size: "16-bit", summary: "The low 16 bits of EBX." },
  { name: "CX", size: "16-bit", summary: "The low 16 bits of ECX." },
  { name: "DX", size: "16-bit", summary: "The low 16 bits of EDX." },
  { name: "SI", size: "16-bit", summary: "The low 16 bits of ESI." },
  { name: "DI", size: "16-bit", summary: "The low 16 bits of EDI." },
  { name: "BP", size: "16-bit", summary: "The low 16 bits of EBP." },
  { name: "SP", size: "16-bit", summary: "The low 16 bits of ESP." },
  { name: "AL", size: "8-bit", summary: "The low 8 bits of AX. Holds a single character for WriteChar and ReadChar." },
  { name: "AH", size: "8-bit", summary: "The high 8 bits of AX." },
  { name: "BL", size: "8-bit", summary: "The low 8 bits of BX." },
  { name: "BH", size: "8-bit", summary: "The high 8 bits of BX." },
  { name: "CL", size: "8-bit", summary: "The low 8 bits of CX. Holds the shift count for the variable shift instructions." },
  { name: "CH", size: "8-bit", summary: "The high 8 bits of CX." },
  { name: "DL", size: "8-bit", summary: "The low 8 bits of DX. Holds the column for Gotoxy." },
  { name: "DH", size: "8-bit", summary: "The high 8 bits of DX. Holds the row for Gotoxy." },
]

export const REGISTER_NAMES: Set<string> = new Set(REGISTERS.map((r) => r.name.toLowerCase()))
