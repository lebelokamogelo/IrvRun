TITLE Fahrenheit to Celsius

; Converts a Fahrenheit temperature to Celsius with integer arithmetic:
; celsius = (fahrenheit - 32) * 5 / 9

INCLUDE Irvine32.inc

.data
    prompt   BYTE "Enter a temperature in Fahrenheit: ", 0
    middle   BYTE " degrees Fahrenheit is ", 0
    suffix   BYTE " degrees Celsius.", 0
    again    BYTE "Convert another? (y/n) ", 0
    fahren   SDWORD ?

.code
main PROC
    call Clrscr

convertNext:
    mov edx, OFFSET prompt
    call WriteString
    call ReadInt
    mov fahren, eax

    sub eax, 32
    imul eax, 5
    cdq                         ; sign-extend EAX into EDX:EAX before idiv
    mov ebx, 9
    idiv ebx
    mov esi, eax                ; hold on to the result while we print

    mov eax, fahren
    call WriteInt
    mov edx, OFFSET middle
    call WriteString
    mov eax, esi
    call WriteInt
    mov edx, OFFSET suffix
    call WriteString
    call Crlf
    call Crlf

    mov edx, OFFSET again
    call WriteString
    call ReadChar
    call WriteChar
    call Crlf
    call Crlf

    cmp al, 'y'
    je convertNext
    cmp al, 'Y'
    je convertNext

    exit
main ENDP

END main
