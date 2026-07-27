TITLE Tic-Tac-Toe vs Computer

; Play Tic-Tac-Toe against the computer on the console.
; You are X, the computer is O.

INCLUDE Irvine32.inc

.data
; The board is nine cells, laid out like a numeric keypad:
;   0 1 2
;   3 4 5
;   6 7 8
; 0 = empty, 1 = player (X), 2 = computer (O).
board  BYTE 9 DUP(0)

lines  BYTE 0,1,2, 3,4,5, 6,7,8, 0,3,6, 1,4,7, 2,5,8, 0,4,8, 2,4,6

who      BYTE 0          ; which mark a check is asking about
emptyIdx DWORD 0         ; scratch used while scanning a line
whoCnt   DWORD 0
emptyCnt DWORD 0

titleMsg  BYTE "TIC-TAC-TOE    You are X, the computer is O",0
rowSep    BYTE "---+---+---",0
promptMsg BYTE "Your move (1-9): ",0
badMsg    BYTE "Pick a number from 1 to 9.",13,10,0
takenMsg  BYTE "That square is already taken.",13,10,0
winMsg    BYTE "You win!",0
loseMsg   BYTE "Computer wins.",0
drawMsg   BYTE "It's a draw.",0
againMsg  BYTE "Press R to play again or Q to quit: ",0

.code
main PROC
newGame:
    ; wipe the board for a fresh game
    mov esi, 0
clrBoard:
    cmp esi, 9
    jge turnLoop
    mov byte ptr board[esi], 0
    inc esi
    jmp clrBoard

turnLoop:
    call DrawBoard
    call PlayerMove

    mov who, 1
    call CheckWin
    cmp eax, 1
    je playerWins
    call IsDraw
    cmp eax, 1
    je itsDraw

    call ComputerMove
    mov who, 2
    call CheckWin
    cmp eax, 1
    je compWins
    call IsDraw
    cmp eax, 1
    je itsDraw
    jmp turnLoop

playerWins:
    call DrawBoard
    mov eax, lightGreen
    call SetTextColor
    mov edx, OFFSET winMsg
    call WriteString
    jmp endRound
compWins:
    call DrawBoard
    mov eax, lightRed
    call SetTextColor
    mov edx, OFFSET loseMsg
    call WriteString
    jmp endRound
itsDraw:
    call DrawBoard
    mov eax, yellow
    call SetTextColor
    mov edx, OFFSET drawMsg
    call WriteString
endRound:
    call Crlf
    mov eax, white
    call SetTextColor
    mov edx, OFFSET againMsg
    call WriteString
askAgain:
    call ReadChar
    or al, 20h
    cmp al, 'q'
    je quit
    cmp al, 'r'
    je newGame
    jmp askAgain
quit:
    call Crlf
    exit
main ENDP

; Ask the player for a square and mark it. Re-asks on anything invalid.
PlayerMove PROC
askMove:
    mov eax, white
    call SetTextColor
    mov edx, OFFSET promptMsg
    call WriteString
    call ReadInt
    cmp eax, 1
    jl badInput
    cmp eax, 9
    jg badInput
    dec eax                     ; keypad number -> 0-based index
    mov edi, eax
    cmp byte ptr board[edi], 0
    jne taken
    mov byte ptr board[edi], 1
    ret
badInput:
    mov edx, OFFSET badMsg
    call WriteString
    jmp askMove
taken:
    mov edx, OFFSET takenMsg
    call WriteString
    jmp askMove
PlayerMove ENDP

ComputerMove PROC
    ; win now if we can
    mov who, 2
    call FindWinningMove
    cmp eax, -1
    jne playAt
    ; otherwise stop the player from winning
    mov who, 1
    call FindWinningMove
    cmp eax, -1
    jne playAt
    ; center
    mov eax, 4
    cmp byte ptr board[4], 0
    je playAt
    ; corners, then sides, in a fixed order
    mov eax, 0
    cmp byte ptr board[0], 0
    je playAt
    mov eax, 2
    cmp byte ptr board[2], 0
    je playAt
    mov eax, 6
    cmp byte ptr board[6], 0
    je playAt
    mov eax, 8
    cmp byte ptr board[8], 0
    je playAt
    mov eax, 1
    cmp byte ptr board[1], 0
    je playAt
    mov eax, 3
    cmp byte ptr board[3], 0
    je playAt
    mov eax, 5
    cmp byte ptr board[5], 0
    je playAt
    mov eax, 7                  ; last square standing
playAt:
    mov edi, eax
    mov byte ptr board[edi], 2
    ret
ComputerMove ENDP

; Look for a line that already has two of 'who' and one empty square.
; Returns that empty square's index in EAX, or -1 if there isn't one.
FindWinningMove PROC
    mov esi, 0                  ; byte offset into the lines table
    mov ecx, 8                  ; lines remaining to check
fwLine:
    mov whoCnt, 0
    mov emptyCnt, 0
    mov emptyIdx, -1
    mov ebx, 0
fwCell:
    cmp ebx, 3
    jge fwEval
    mov eax, esi
    add eax, ebx
    movzx edi, byte ptr lines[eax]
    mov al, byte ptr board[edi]
    cmp al, who
    jne fwNotMine
    inc whoCnt
    jmp fwCellNext
fwNotMine:
    cmp al, 0
    jne fwCellNext
    inc emptyCnt
    mov emptyIdx, edi
fwCellNext:
    inc ebx
    jmp fwCell
fwEval:
    cmp whoCnt, 2
    jne fwNext
    cmp emptyCnt, 1
    jne fwNext
    mov eax, emptyIdx
    ret
fwNext:
    add esi, 3
    dec ecx
    jnz fwLine
    mov eax, -1
    ret
FindWinningMove ENDP

CheckWin PROC
    mov dl, who
    mov esi, 0
    mov ecx, 8
cwLine:
    movzx ebx, byte ptr lines[esi]
    cmp byte ptr board[ebx], dl
    jne cwNext
    movzx ebx, byte ptr lines[esi+1]
    cmp byte ptr board[ebx], dl
    jne cwNext
    movzx ebx, byte ptr lines[esi+2]
    cmp byte ptr board[ebx], dl
    jne cwNext
    mov eax, 1
    ret
cwNext:
    add esi, 3
    dec ecx
    jnz cwLine
    mov eax, 0
    ret
CheckWin ENDP

IsDraw PROC
    mov esi, 0
idLoop:
    cmp esi, 9
    jge idFull
    cmp byte ptr board[esi], 0
    je idOpen
    inc esi
    jmp idLoop
idFull:
    mov eax, 1
    ret
idOpen:
    mov eax, 0
    ret
IsDraw ENDP

DrawBoard PROC
    call Clrscr
    mov eax, white
    call SetTextColor
    mov edx, OFFSET titleMsg
    call WriteString
    call Crlf
    call Crlf

    mov esi, 0                  ; cell index, 0..8
    mov ecx, 0                  ; current row
dbRow:
    cmp ecx, 3
    jge dbDone
    mov ebx, 0                  ; current column
dbCol:
    cmp ebx, 3
    jge dbEndRow
    mov al, ' '
    call WriteChar
    movzx edi, byte ptr board[esi]
    cmp edi, 1
    je dbX
    cmp edi, 2
    je dbO
    mov eax, esi
    inc eax
    call WriteDec
    jmp dbCell
dbX:
    mov eax, lightCyan
    call SetTextColor
    mov al, 'X'
    call WriteChar
    mov eax, white
    call SetTextColor
    jmp dbCell
dbO:
    mov eax, lightRed
    call SetTextColor
    mov al, 'O'
    call WriteChar
    mov eax, white
    call SetTextColor
dbCell:
    mov al, ' '
    call WriteChar
    cmp ebx, 2
    jge dbNoBar
    mov al, '|'
    call WriteChar
dbNoBar:
    inc ebx
    inc esi
    jmp dbCol
dbEndRow:
    call Crlf
    cmp ecx, 2
    jge dbNoSep
    mov edx, OFFSET rowSep
    call WriteString
    call Crlf
dbNoSep:
    inc ecx
    jmp dbRow
dbDone:
    call Crlf
    ret
DrawBoard ENDP

END main
