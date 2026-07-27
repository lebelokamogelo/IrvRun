TITLE Snake Game

; Classic Snake for the Windows console.
; The snake crawls on its own; steer it into the food to grow and score.
; Running into a wall or your own tail ends the round.
;
; Controls:  arrow keys to steer,  Q to quit

INCLUDE Irvine32.inc
INCLUDELIB user32.lib

GW = 40                 ; playfield width, in cells
GH = 18                 ; playfield height, in cells
MAXLEN = 800

VK_LEFT  = 25h
VK_UP    = 26h
VK_RIGHT = 27h
VK_DOWN  = 28h

GetAsyncKeyState PROTO, vKey:DWORD

.data
; The snake is two parallel arrays of cell coordinates. Index 0 is the head.
snakeX    SDWORD MAXLEN DUP(0)
snakeY    SDWORD MAXLEN DUP(0)
snakeLen  DWORD  4
dirX      SDWORD 1        ; current heading, one of {-1,0,1}
dirY      SDWORD 0
foodX     SDWORD 0
foodY     SDWORD 0
newHeadX  SDWORD 0        ; where the head wants to move this tick
newHeadY  SDWORD 0
score     DWORD  0
highScore DWORD  0        ; kept between rounds, lost when the program closes
ateFlag   DWORD  0        ; set when the head landed on food this tick
speed     DWORD  110      ; frame delay in ms; lower is faster

titleMsg BYTE "SNAKE  -  Arrows to move, Q to quit",0
scoreLbl BYTE "Score: ",0
highLbl  BYTE "   High: ",0
overMsg  BYTE "GAME OVER!  Score: ",0
againMsg BYTE "Press R to play again or Q to quit",0
quitMsg  BYTE "Thanks for playing!",0

.code
main PROC
newGame:
    call InitGame
    call Clrscr
    call DrawBorder

    ; controls hint sits just under the board
    mov eax, white
    call SetTextColor
    mov dl, 0
    mov dh, GH+3
    call Gotoxy
    mov edx, OFFSET titleMsg
    call WriteString

    call PlaceFood
    call DrawFood
    call DrawSnakeInit
    call DrawScore

gameLoop:
    ; Poll each direction in turn. A key held down keeps steering, and the
    ; snake still advances on ticks where nothing is pressed.
    INVOKE GetAsyncKeyState, VK_UP
    and eax, 8000h
    jnz setUp
    INVOKE GetAsyncKeyState, 'W'
    and eax, 8000h
    jnz setUp
    INVOKE GetAsyncKeyState, VK_DOWN
    and eax, 8000h
    jnz setDown
    INVOKE GetAsyncKeyState, 'S'
    and eax, 8000h
    jnz setDown
    INVOKE GetAsyncKeyState, VK_LEFT
    and eax, 8000h
    jnz setLeft
    INVOKE GetAsyncKeyState, 'A'
    and eax, 8000h
    jnz setLeft
    INVOKE GetAsyncKeyState, VK_RIGHT
    and eax, 8000h
    jnz setRight
    INVOKE GetAsyncKeyState, 'D'
    and eax, 8000h
    jnz setRight
    INVOKE GetAsyncKeyState, 'Q'
    and eax, 8000h
    jnz quitGame
    jmp afterInput

setUp:
    cmp dirY, 1
    je afterInput
    mov dirX, 0
    mov dirY, -1
    jmp afterInput
setDown:
    cmp dirY, -1
    je afterInput
    mov dirX, 0
    mov dirY, 1
    jmp afterInput
setLeft:
    cmp dirX, 1
    je afterInput
    mov dirX, -1
    mov dirY, 0
    jmp afterInput
setRight:
    cmp dirX, -1
    je afterInput
    mov dirX, 1
    mov dirY, 0
    jmp afterInput
afterInput:

    ; work out the head's next cell from the current heading
    mov eax, snakeX[0]
    add eax, dirX
    mov newHeadX, eax
    mov eax, snakeY[0]
    add eax, dirY
    mov newHeadY, eax

    ; walls
    mov eax, newHeadX
    cmp eax, 0
    jl gameOver
    cmp eax, GW
    jge gameOver
    mov eax, newHeadY
    cmp eax, 0
    jl gameOver
    cmp eax, GH
    jge gameOver

    mov esi, 0
selfChk:
    mov eax, snakeLen
    dec eax
    cmp esi, eax
    jge selfDone
    mov eax, snakeX[esi*4]
    cmp eax, newHeadX
    jne selfNext
    mov eax, snakeY[esi*4]
    cmp eax, newHeadY
    jne selfNext
    jmp gameOver
selfNext:
    inc esi
    jmp selfChk
selfDone:

    ; food?
    mov eax, newHeadX
    cmp eax, foodX
    jne noEat
    mov eax, newHeadY
    cmp eax, foodY
    jne noEat

    inc score
    mov eax, score
    cmp eax, highScore
    jle skipHigh
    mov highScore, eax
skipHigh:
    mov eax, snakeLen
    cmp eax, MAXLEN
    jge skipGrow
    inc snakeLen
skipGrow:
    mov ateFlag, 1
    jmp doShift
noEat:
    mov ateFlag, 0
    mov esi, snakeLen
    dec esi
    mov ebx, snakeX[esi*4]
    mov ecx, snakeY[esi*4]
    call GotoCell
    mov al, ' '
    call WriteChar
doShift:

    mov esi, snakeLen
    dec esi
shiftLoop:
    cmp esi, 1
    jl shiftDone
    mov edi, esi
    dec edi
    mov eax, snakeX[edi*4]
    mov snakeX[esi*4], eax
    mov eax, snakeY[edi*4]
    mov snakeY[esi*4], eax
    dec esi
    jmp shiftLoop
shiftDone:
    mov eax, newHeadX
    mov snakeX[0], eax
    mov eax, newHeadY
    mov snakeY[0], eax

    ; draw the head, then repaint the cell behind it as a plain body segment
    mov ebx, snakeX[0]
    mov ecx, snakeY[0]
    call GotoCell
    mov eax, lightGreen
    call SetTextColor
    mov al, 'O'
    call WriteChar

    mov eax, snakeLen
    cmp eax, 1
    jle skipBody
    mov ebx, snakeX[4]
    mov ecx, snakeY[4]
    call GotoCell
    mov eax, green
    call SetTextColor
    mov al, 'o'
    call WriteChar
skipBody:

    cmp ateFlag, 1
    jne afterFood
    call PlaceFood
    call DrawFood
    call DrawScore
afterFood:

    mov eax, speed
    call Delay
    jmp gameLoop

gameOver:
    mov eax, lightRed
    call SetTextColor
    mov dl, 0
    mov dh, GH+4
    call Gotoxy
    mov edx, OFFSET overMsg
    call WriteString
    mov eax, score
    call WriteInt

    mov eax, white
    call SetTextColor
    mov dl, 0
    mov dh, GH+5
    call Gotoxy
    mov edx, OFFSET againMsg
    call WriteString
askAgain:
    call ReadChar
    or al, 20h
    cmp al, 'q'
    je byeBye
    cmp al, 'r'
    je newGame
    jmp askAgain

quitGame:
byeBye:
    call Clrscr
    mov eax, white
    call SetTextColor
    mov edx, OFFSET quitMsg
    call WriteString
    call Crlf
    exit
main ENDP

; Reset everything for a fresh round. High score is deliberately left alone.
InitGame PROC
    mov esi, 0
ig1:
    cmp esi, 4
    jge ig2
    mov eax, 20
    sub eax, esi
    mov snakeX[esi*4], eax
    mov eax, 9
    mov snakeY[esi*4], eax
    inc esi
    jmp ig1
ig2:
    mov snakeLen, 4
    mov dirX, 1
    mov dirY, 0
    mov score, 0
    ret
InitGame ENDP

; Move the cursor to a playfield cell. The +1 skips over the border.
;   EBX = cell x,  ECX = cell y
GotoCell PROC
    mov dl, bl
    inc dl
    mov dh, cl
    inc dh
    call Gotoxy
    ret
GotoCell ENDP

; Draw the frame around the playfield once at startup.
DrawBorder PROC
    mov eax, white
    call SetTextColor
    mov ecx, 0
top1:
    cmp ecx, GW+2
    jge sides
    mov dl, cl
    mov dh, 0
    call Gotoxy
    mov al, '='
    call WriteChar
    mov dl, cl
    mov dh, GH+1
    call Gotoxy
    mov al, '='
    call WriteChar
    inc ecx
    jmp top1
sides:
    mov ecx, 0
side1:
    cmp ecx, GH+2
    jge borderDone
    mov dl, 0
    mov dh, cl
    call Gotoxy
    mov al, '|'
    call WriteChar
    mov dl, GW+1
    mov dh, cl
    call Gotoxy
    mov al, '|'
    call WriteChar
    inc ecx
    jmp side1
borderDone:
    ret
DrawBorder ENDP

; Drop food on a random empty cell, re-rolling if it lands on the snake.
PlaceFood PROC
retry:
    mov eax, GW
    call RandomRange
    mov foodX, eax
    mov eax, GH
    call RandomRange
    mov foodY, eax
    mov esi, 0
pfChk:
    mov eax, snakeLen
    cmp esi, eax
    jge pfDone
    mov eax, snakeX[esi*4]
    cmp eax, foodX
    jne pfNext
    mov eax, snakeY[esi*4]
    cmp eax, foodY
    jne pfNext
    jmp retry
pfNext:
    inc esi
    jmp pfChk
pfDone:
    ret
PlaceFood ENDP

DrawFood PROC
    mov ebx, foodX
    mov ecx, foodY
    call GotoCell
    mov eax, lightRed
    call SetTextColor
    mov al, '*'
    call WriteChar
    ret
DrawFood ENDP

; Paint the whole snake once, when a round starts.
DrawSnakeInit PROC
    mov esi, 0
dsi:
    mov eax, snakeLen
    cmp esi, eax
    jge dsiDone
    mov ebx, snakeX[esi*4]
    mov ecx, snakeY[esi*4]
    call GotoCell
    cmp esi, 0
    jne dsiBody
    mov eax, lightGreen
    call SetTextColor
    mov al, 'O'
    jmp dsiPut
dsiBody:
    mov eax, green
    call SetTextColor
    mov al, 'o'
dsiPut:
    call WriteChar
    inc esi
    jmp dsi
dsiDone:
    ret
DrawSnakeInit ENDP

; Score and high score share one line under the board.
DrawScore PROC
    mov eax, white
    call SetTextColor
    mov dl, 0
    mov dh, GH+2
    call Gotoxy
    mov edx, OFFSET scoreLbl
    call WriteString
    mov eax, score
    call WriteInt
    mov edx, OFFSET highLbl
    call WriteString
    mov eax, highScore
    call WriteInt
    mov al, ' '
    call WriteChar
    call WriteChar
    ret
DrawScore ENDP

END main
