TITLE Reverse a String

; Reads a line of text and writes it back to front, one character at a time.

INCLUDE Irvine32.inc

BUFFER_SIZE = 128

.data
    prompt   BYTE "Enter a line of text: ", 0
    heading  BYTE "Reversed: ", 0
    buffer   BYTE BUFFER_SIZE DUP(0)
    typed    DWORD ?

.code
main PROC
    call Clrscr
    mov edx, OFFSET prompt
    call WriteString

    mov edx, OFFSET buffer
    mov ecx, BUFFER_SIZE - 1
    call ReadString
    mov typed, eax

    cmp eax, 0
    je finish

    mov edx, OFFSET heading
    call WriteString

    ; Walk backwards from the last character to the first.
    mov esi, OFFSET buffer
    add esi, typed
    dec esi
    mov ecx, typed

writeNext:
    mov al, [esi]
    call WriteChar
    dec esi
    loop writeNext

    call Crlf

finish:
    call Crlf
    call WaitMsg
    exit
main ENDP

END main
