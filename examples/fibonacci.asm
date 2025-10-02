TITLE Fibonacci Sequence

; Prints the first N terms of the Fibonacci sequence.
; Term 46 is the largest one that still fits in a 32-bit register.

INCLUDE Irvine32.inc

MAX_TERMS = 46

.data
    prompt  BYTE "How many terms would you like (1 to 46)? ", 0
    outOfRange BYTE "Please choose a number between 1 and 46.", 0
    gap     BYTE "  ", 0
    terms   DWORD ?

.code
main PROC
    call Clrscr

askAgain:
    mov edx, OFFSET prompt
    call WriteString
    call ReadInt
    cmp eax, 1
    jl outOfBounds
    cmp eax, MAX_TERMS
    jg outOfBounds
    mov terms, eax
    jmp showSeries

outOfBounds:
    mov edx, OFFSET outOfRange
    call WriteString
    call Crlf
    jmp askAgain

showSeries:
    call Crlf
    mov ecx, terms
    mov eax, 0                  ; the current term
    mov ebx, 1                  ; the term after it

nextTerm:
    call WriteDec
    mov edx, OFFSET gap
    call WriteString

    add eax, ebx                ; eax = current + next
    xchg eax, ebx               ; move the window along by one term
    loop nextTerm

    call Crlf
    call Crlf
    call WaitMsg
    exit
main ENDP

END main
