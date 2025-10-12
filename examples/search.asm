TITLE Binary Search

; Looks a value up in a sorted table, halving the search range each time.

INCLUDE Irvine32.inc

COUNT = 15

.data
    heading  BYTE "The table holds every third number from 0 to 42.", 0
    prompt   BYTE "Search for: ", 0
    foundAt  BYTE "Found at index ", 0
    notFound BYTE "That value is not in the table.", 0
    table    DWORD 0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42
    target   DWORD ?

.code
main PROC
    call Clrscr
    mov edx, OFFSET heading
    call WriteString
    call Crlf
    call Crlf

    mov edx, OFFSET prompt
    call WriteString
    call ReadInt
    mov target, eax

    call binarySearch
    cmp eax, -1
    je missing

    mov edx, OFFSET foundAt
    call WriteString
    call WriteDec
    jmp finish

missing:
    mov edx, OFFSET notFound
    call WriteString

finish:
    call Crlf
    call Crlf
    call WaitMsg
    exit
main ENDP

; Returns the index of `target` in `table`, or -1 when it is not there.
binarySearch PROC
    mov ebx, 0                  ; low
    mov esi, COUNT - 1          ; high

searchNext:
    cmp ebx, esi
    jg notPresent

    mov eax, ebx
    add eax, esi
    shr eax, 1                  ; middle = (low + high) / 2
    mov edi, eax

    mov eax, table[edi * TYPE table]
    cmp eax, target
    je present
    jl searchRight

    mov esi, edi                ; look in the lower half
    dec esi
    jmp searchNext

searchRight:
    mov ebx, edi                ; look in the upper half
    inc ebx
    jmp searchNext

present:
    mov eax, edi
    ret

notPresent:
    mov eax, -1
    ret
binarySearch ENDP

END main
