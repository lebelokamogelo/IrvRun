TITLE Guess the Number

; A number guessing game for the Windows console.
; The computer picks a secret number and tells you whether each guess was
; too high or too low. Finding it in fewer guesses is better.
;
; Controls:  type a number and press Enter,  R to play again,  Q to quit

INCLUDE Irvine32.inc

UPPER    = 100          ; the secret is between 1 and UPPER
MAXTRIES = 7            ; guesses allowed per round

.data
    banner     BYTE "GUESS THE NUMBER", 0
    rules      BYTE "I am thinking of a number from 1 to 100.", 0
    rulesTries BYTE "You get seven guesses.", 0
    askGuess   BYTE "Guess: ", 0
    remaining  BYTE "Guesses left: ", 0
    tooLow     BYTE "Too low.", 0
    tooHigh    BYTE "Too high.", 0
    outOfRange BYTE "Numbers from 1 to 100 only.", 0
    wonHead    BYTE "Correct! You found it in ", 0
    guessTail  BYTE " guess(es).", 0
    lostHead   BYTE "Out of guesses. The number was ", 0
    bestHead   BYTE "Best round so far: ", 0
    againMsg   BYTE "Press R to play again, or Q to quit.", 0
    period     BYTE ".", 0

    secret     DWORD ?
    tries      DWORD ?
    best       DWORD 0          ; 0 until the first win

.code
main PROC
    call Randomize

newRound:
    call Clrscr
    call showHeader
    call pickSecret
    mov tries, 0

nextGuess:
    call showRemaining
    mov edx, OFFSET askGuess
    call WriteString
    call ReadInt
    call Crlf

    cmp eax, 1
    jl rejectGuess
    cmp eax, UPPER
    jg rejectGuess

    inc tries
    cmp eax, secret
    je roundWon
    jl guessWasLow

    mov edx, OFFSET tooHigh
    call WriteString
    call Crlf
    call Crlf
    jmp checkTries

guessWasLow:
    mov edx, OFFSET tooLow
    call WriteString
    call Crlf
    call Crlf
    jmp checkTries

rejectGuess:
    mov edx, OFFSET outOfRange
    call WriteString
    call Crlf
    call Crlf
    jmp nextGuess

checkTries:
    mov eax, tries
    cmp eax, MAXTRIES
    jb nextGuess

    mov edx, OFFSET lostHead
    call WriteString
    mov eax, secret
    call WriteDec
    mov edx, OFFSET period
    call WriteString
    call Crlf
    jmp roundOver

roundWon:
    mov edx, OFFSET wonHead
    call WriteString
    mov eax, tries
    call WriteDec
    mov edx, OFFSET guessTail
    call WriteString
    call Crlf
    call recordBest

roundOver:
    call showBest
    call Crlf
    mov edx, OFFSET againMsg
    call WriteString
    call Crlf

waitForKey:
    call ReadChar
    cmp al, 'r'
    je newRound
    cmp al, 'R'
    je newRound
    cmp al, 'q'
    je quitGame
    cmp al, 'Q'
    je quitGame
    jmp waitForKey

quitGame:
    call Clrscr
    exit
main ENDP

; Writes the banner and the rules.
showHeader PROC
    mov eax, white + (blue * 16)
    call SetTextColor
    mov edx, OFFSET banner
    call WriteString
    mov eax, lightGray
    call SetTextColor
    call Crlf
    call Crlf
    mov edx, OFFSET rules
    call WriteString
    call Crlf
    mov edx, OFFSET rulesTries
    call WriteString
    call Crlf
    call Crlf
    ret
showHeader ENDP

; Picks the secret number, from 1 to UPPER.
pickSecret PROC
    mov eax, UPPER
    call RandomRange
    inc eax
    mov secret, eax
    ret
pickSecret ENDP

; Writes how many guesses are left in this round.
showRemaining PROC
    mov edx, OFFSET remaining
    call WriteString
    mov eax, MAXTRIES
    sub eax, tries
    call WriteDec
    call Crlf
    ret
showRemaining ENDP

; Keeps the smallest number of guesses used to win a round.
recordBest PROC
    mov eax, tries
    cmp best, 0
    je storeBest
    cmp eax, best
    jae keepBest
storeBest:
    mov best, eax
keepBest:
    ret
recordBest ENDP

; Writes the best round so far, if there has been one.
showBest PROC
    cmp best, 0
    je noBest
    mov edx, OFFSET bestHead
    call WriteString
    mov eax, best
    call WriteDec
    mov edx, OFFSET guessTail
    call WriteString
    call Crlf
noBest:
    ret
showBest ENDP

END main
