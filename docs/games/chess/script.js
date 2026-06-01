var board = null;
var game = new Chess();
var $status = $('#status');
var gameMode = 'pvp';
var difficulty = 'easy';
var selectedSquare = null;

function initGame() {
    GameManager.setGame('chess', false, difficulty.toUpperCase());
    if (board) {
        board.destroy();
    }

    var config = {
        draggable: false, // Disabling drag and drop
        position: 'start',
        pieceTheme: '../../assets/chess/{piece}.png'
    };

    board = Chessboard('board', config);

    // Attach click events to squares using delegation
    // Using a more generic selector and ensuring we capture clicks on the piece images too
    $('#board').on('click', '.square-55d63', function() {
        var square = $(this).attr('data-square');
        if (!square) {
            square = $(this).closest('.square-55d63').attr('data-square');
        }
        console.log('Clicked square:', square);
        onSquareClick(square);
    });

    setTimeout(() => {
        board.resize();
        updateStatus();
    }, 300);
}

function removeHighlights() {
    $('.square-55d63').removeClass('highlight-move highlight-selected');
}

function onSquareClick(square) {
    if (!square) return;
    if (game.game_over()) return;
    if (gameMode !== 'pvp' && game.turn() === 'b') return;

    var piece = game.get(square);

    if (selectedSquare) {
        var move = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q'
        });

        if (move !== null) {
            board.position(game.fen());
            selectedSquare = null;
            removeHighlights();
            updateStatus();

            if (gameMode !== 'pvp' && !game.game_over()) {
                window.setTimeout(makeAIMove, 500);
            }
            return;
        }
    }

    if (piece && piece.color === game.turn()) {
        if (selectedSquare === square) {
            selectedSquare = null;
            removeHighlights();
            return;
        }

        selectedSquare = square;
        removeHighlights();
        $('.square-' + square).addClass('highlight-selected');

        var moves = game.moves({
            square: square,
            verbose: true
        });

        moves.forEach(function(m) {
            $('.square-' + m.to).addClass('highlight-move');
        });
    } else {
        selectedSquare = null;
        removeHighlights();
    }
}

function makeAIMove() {
    if (game.game_over()) return;
    var move;
    if (difficulty === 'easy') {
        var possibleMoves = game.moves();
        move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else {
        move = getBestMoveIterative();
    }
    game.move(move);
    board.position(game.fen());
    updateStatus();
}

function getBestMoveIterative() {
    var maxDepth = difficulty === 'hard' ? 3 : 2;
    var bestMove = null;
    var startTime = new Date().getTime();
    var timeLimit = 2000;
    for (var depth = 1; depth <= maxDepth; depth++) {
        var result = minimaxChess(game, depth, -10000, 10000, true, startTime, timeLimit);
        if (result.move) bestMove = result.move;
        if (new Date().getTime() - startTime > timeLimit) break;
    }
    return bestMove || game.moves()[0];
}

function minimaxChess(game, depth, alpha, beta, isMaximizing, startTime, timeLimit) {
    if (startTime && new Date().getTime() - startTime > timeLimit) return { value: evaluateBoard(game.board()) };
    if (depth === 0 || game.game_over()) return { value: evaluateBoard(game.board()) };
    var moves = game.moves();
    moves.sort((a, b) => (b.includes('x') ? 1 : 0) - (a.includes('x') ? 1 : 0));
    var bestMove = null;
    if (isMaximizing) {
        var bestValue = -9999;
        for (var i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            var val = minimaxChess(game, depth - 1, alpha, beta, !isMaximizing, startTime, timeLimit).value;
            game.undo();
            if (val > bestValue) { bestValue = val; bestMove = moves[i]; }
            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) break;
        }
        return { value: bestValue, move: bestMove };
    } else {
        var bestValue = 9999;
        for (var i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            var val = minimaxChess(game, depth - 1, alpha, beta, !isMaximizing, startTime, timeLimit).value;
            game.undo();
            if (val < bestValue) { bestValue = val; bestMove = moves[i]; }
            beta = Math.min(beta, bestValue);
            if (beta <= alpha) break;
        }
        return { value: bestValue, move: bestMove };
    }
}

function evaluateBoard(board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i, j);
        }
    }
    return totalEvaluation;
}

const pawnEvalWhite = [[0,0,0,0,0,0,0,0],[5,5,5,5,5,5,5,5],[1,1,2,3,3,2,1,1],[0.5,0.5,1,2.5,2.5,1,0.5,0.5],[0,0,0,2,2,0,0,0],[0.5,-0.5,-1,0,0,-1,-0.5,0.5],[0.5,1,1,-2,-2,1,1,0.5],[0,0,0,0,0,0,0,0]];
const pawnEvalBlack = pawnEvalWhite.slice().reverse();
const knightEval = [[-5,-4,-3,-3,-3,-3,-4,-5],[-4,-2,0,0,0,0,-2,-4],[-3,0,1,1.5,1.5,1,0,-3],[-3,0.5,1.5,2,2,1.5,0.5,-3],[-3,0,1.5,2,2,1.5,0,-3],[-3,0.5,1,1.5,1.5,1,0.5,-3],[-4,-2,0,0.5,0.5,0,-2,-4],[-5,-4,-3,-3,-3,-3,-4,-5]];
const bishopEvalWhite = [[-2,-1,-1,-1,-1,-1,-1,-2],[-1,0,0,0,0,0,0,-1],[-1,0,0.5,1,1,0.5,0,-1],[-1,0.5,0.5,1,1,0.5,0.5,-1],[-1,0,1,1,1,1,0,-1],[-1,1,1,1,1,1,1,-1],[-1,0.5,0,0,0,0,0.5,-1],[-2,-1,-1,-1,-1,-1,-1,-2]];
const bishopEvalBlack = bishopEvalWhite.slice().reverse();
const rookEvalWhite = [[0,0,0,0,0,0,0,0],[0.5,1,1,1,1,1,1,0.5],[-0.5,0,0,0,0,0,0,-0.5],[-0.5,0,0,0,0,0,0,-0.5],[-0.5,0,0,0,0,0,0,-0.5],[-0.5,0,0,0,0,0,0,-0.5],[-0.5,0,0,0,0,0,0,-0.5],[0,0,0,0.5,0.5,0,0,0]];
const rookEvalBlack = rookEvalWhite.slice().reverse();
const evalQueen = [[-2,-1,-1,-0.5,-0.5,-1,-1,-2],[-1,0,0,0,0,0,0,-1],[-1,0,0.5,0.5,0.5,0.5,0,-1],[-0.5,0,0.5,0.5,0.5,0.5,0,-0.5],[0,0,0.5,0.5,0.5,0.5,0,-0.5],[-1,0.5,0.5,0.5,0.5,0.5,0,-1],[-1,0,0.5,0,0,0,0,-1],[-2,-1,-1,-0.5,-0.5,-1,-1,-2]];
const kingEvalWhite = [[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-2,-3,-3,-4,-4,-3,-3,-2],[-1,-2,-2,-2,-2,-2,-2,-1],[2,2,0,0,0,0,2,2],[2,3,1,0,0,1,3,2]];
const kingEvalBlack = kingEvalWhite.slice().reverse();

function getPieceValue(piece, x, y) {
    if (piece === null) return 0;
    var getAbsoluteValue = function (piece, x, y) {
        if (piece.type === 'p') return 10 + (piece.color === 'w' ? pawnEvalWhite[x][y] : pawnEvalBlack[x][y]);
        else if (piece.type === 'r') return 50 + (piece.color === 'w' ? rookEvalWhite[x][y] : rookEvalBlack[x][y]);
        else if (piece.type === 'n') return 30 + knightEval[x][y];
        else if (piece.type === 'b') return 30 + (piece.color === 'w' ? bishopEvalWhite[x][y] : bishopEvalBlack[x][y]);
        else if (piece.type === 'q') return 90 + evalQueen[x][y];
        else if (piece.type === 'k') return 900 + (piece.color === 'w' ? kingEvalWhite[x][y] : kingEvalBlack[x][y]);
        return 0;
    };
    var absoluteValue = getAbsoluteValue(piece, x, y);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
}

function updateStatus() {
    var status = '';
    var moveColor = game.turn() === 'b' ? 'Negro' : 'Blanco';

    $('.square-55d63').removeClass('highlight-check');

    if (game.in_check()) {
        const boardState = game.board();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = boardState[r][c];
                if (p && p.type === 'k' && p.color === game.turn()) {
                    const square = String.fromCharCode(97 + c) + (8 - r);
                    $(`.square-${square}`).addClass('highlight-check');
                }
            }
        }
    }

    if (game.in_checkmate()) {
        status = '¡JAQUEMATE! El equipo ' + (game.turn() === 'w' ? 'Negro' : 'Blanco') + ' gana.';
        $status.html(status);
        setTimeout(() => {
            if (gameMode !== 'pvp') {
                if (game.turn() === 'b') GameManager.showResult('win', '¡Has hecho Jaquemate!');
                else GameManager.showResult('loss', 'La IA te ha hecho Jaquemate.');
            } else {
                UIManager.alert('Fin del Juego', status, 'success');
            }
        }, 1000);
    } else if (game.in_draw()) {
        status = 'JUEGO TERMINADO: Tablas';
        $status.html(status);
        setTimeout(() => {
            if (gameMode !== 'pvp') GameManager.showResult('draw');
            else UIManager.alert('Fin del Juego', status, 'warning');
        }, 1000);
    } else {
        status = 'Turno de: ' + moveColor;
        if (game.in_check()) status += ' (¡EN JAQUE!)';
        $status.html(status);
    }
}

$('#reset-btn').on('click', function() {
    game.reset();
    board.start();
    selectedSquare = null;
    removeHighlights();
    updateStatus();
});

$('#undo-btn').on('click', function() {
    game.undo();
    if (gameMode !== 'pvp') game.undo();
    board.position(game.fen());
    selectedSquare = null;
    removeHighlights();
    updateStatus();
});
