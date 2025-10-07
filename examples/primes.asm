TITLE Sieve of Eratosthenes

; Prints every prime up to LIMIT.
; sieve[i] stays 1 for as long as i might still be prime.

INCLUDE Irvine32.inc

LIMIT = 200

.data
    heading BYTE "Primes up to 200:", 0
    gap     BYTE " ", 0
    sieve   BYTE (LIMIT + 1) DUP(1)

.code
main PROC
    call Clrscr
    mov edx, OFFSET heading
    call WriteString
    call Crlf
    call Crlf

    mov sieve[0], 0             ; 0 and 1 are not prime
    mov sieve[1], 0

    mov ebx, 2
markOuter:
    mov eax, ebx
    mul ebx                     ; start crossing off at ebx squared
    cmp eax, LIMIT
    ja printPrimes
    cmp sieve[ebx], 0
    je nextCandidate

    mov esi, eax
markInner:
    mov sieve[esi], 0
    add esi, ebx
    cmp esi, LIMIT
    jbe markInner

nextCandidate:
    inc ebx
    jmp markOuter

printPrimes:
    mov esi, 2
printNext:
    cmp sieve[esi], 0
    je skipComposite
    mov eax, esi
    call WriteDec
    mov edx, OFFSET gap
    call WriteString
skipComposite:
    inc esi
    cmp esi, LIMIT
    jbe printNext

    call Crlf
    call Crlf
    call WaitMsg
    exit
main ENDP

END main
