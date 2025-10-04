TITLE Bubble Sort

; Fills an array with random values, sorts it, and prints it before and after.

INCLUDE Irvine32.inc

ARRAY_SIZE = 12
UPPER      = 100

.data
    beforeMsg BYTE "Before: ", 0
    afterMsg  BYTE "After:  ", 0
    gap       BYTE " ", 0
    values    DWORD ARRAY_SIZE DUP(?)

.code
main PROC
    call Clrscr
    call Randomize
    call fillArray

    mov edx, OFFSET beforeMsg
    call WriteString
    call printArray

    call bubbleSort

    mov edx, OFFSET afterMsg
    call WriteString
    call printArray

    call Crlf
    call WaitMsg
    exit
main ENDP

; Fills the array with random values below UPPER.
fillArray PROC
    mov ecx, ARRAY_SIZE
    mov esi, OFFSET values
fillNext:
    mov eax, UPPER
    call RandomRange
    mov [esi], eax
    add esi, TYPE values
    loop fillNext
    ret
fillArray ENDP

; Writes the array on one line.
printArray PROC
    mov ecx, ARRAY_SIZE
    mov esi, OFFSET values
printNext:
    mov eax, [esi]
    call WriteDec
    mov edx, OFFSET gap
    call WriteString
    add esi, TYPE values
    loop printNext
    call Crlf
    ret
printArray ENDP

; Sorts the array in place, smallest first.
bubbleSort PROC
    mov ecx, ARRAY_SIZE
    dec ecx                     ; the outer pass runs size - 1 times

outerPass:
    push ecx                    ; the inner loop needs ECX as well
    mov esi, OFFSET values

innerPass:
    mov eax, [esi]
    cmp eax, [esi + TYPE values]
    jle inOrder
    xchg eax, [esi + TYPE values]
    mov [esi], eax
inOrder:
    add esi, TYPE values
    loop innerPass

    pop ecx
    loop outerPass
    ret
bubbleSort ENDP

END main
