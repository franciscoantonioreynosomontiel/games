var board = null;
var game = new Chess();
var $status = $('#status');
var $fen = $('#fen');
var gameMode = 'pvp';
var difficulty = 'easy';

// Transposition Table
var transpositionTable = {};

// Piece-Square Tables
const pawnEvalWhite = [
    [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
    [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
    [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
    [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
    [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
    [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
    [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
];
const pawnEvalBlack = pawnEvalWhite.slice().reverse();
const knightEval = [
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
    [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
    [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
    [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
    [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
    [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
    [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
];
const bishopEvalWhite = [
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [-1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [-1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [-1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [-1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [-1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [-1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];
const bishopEvalBlack = bishopEvalWhite.slice().reverse();
const rookEvalWhite = [
    [ 0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [ 0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ 0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];
const rookEvalBlack = rookEvalWhite.slice().reverse();
const evalQueen = [
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [-1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [-1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [-0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ 0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [-1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [-1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];
const kingEvalWhite = [
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [ 2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0],
    [ 2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0]
];
const kingEvalBlack = kingEvalWhite.slice().reverse();

function onDragStart(source, piece, position, orientation) {
  if (game.game_over()) return false;
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) return false;
  if (gameMode === 'pva' && game.turn() === 'b') return false;
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
    var maxDepth = difficulty === 'hard' ? 4 : 2;
    var bestMove = null;
    var startTime = new Date().getTime();
    var timeLimit = 2500; // 2.5 seconds limit

    for (var depth = 1; depth <= maxDepth; depth++) {
        var result = minimaxChess(game, depth, -10000, 10000, true, startTime, timeLimit);
        if (result.move) bestMove = result.move;
        if (new Date().getTime() - startTime > timeLimit) break;
    }
    return bestMove || game.moves()[0];
}

function minimaxChess(game, depth, alpha, beta, isMaximizing, startTime, timeLimit) {
    if (startTime && new Date().getTime() - startTime > timeLimit) {
        return { value: evaluateBoard(game.board()) };
    }

    var fen = game.fen();
    if (transpositionTable[fen] && transpositionTable[fen].depth >= depth) {
        return transpositionTable[fen].data;
    }

    if (depth === 0 || game.game_over()) {
        return { value: evaluateBoard(game.board()) };
    }

    var moves = game.moves();
    // Move ordering: simple heuristic - captures first
    moves.sort((a, b) => (b.includes('x') ? 1 : 0) - (a.includes('x') ? 1 : 0));

    var bestMove = null;

    if (isMaximizing) {
        var bestValue = -9999;
        for (var i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            var val = minimaxChess(game, depth - 1, alpha, beta, !isMaximizing, startTime, timeLimit).value;
            game.undo();
            if (val > bestValue) {
                bestValue = val;
                bestMove = moves[i];
            }
            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) break;
        }
        var result = { value: bestValue, move: bestMove };
        transpositionTable[fen] = { depth: depth, data: result };
        return result;
    } else {
        var bestValue = 9999;
        for (var i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            var val = minimaxChess(game, depth - 1, alpha, beta, !isMaximizing, startTime, timeLimit).value;
            game.undo();
            if (val < bestValue) {
                bestValue = val;
                bestMove = moves[i];
            }
            beta = Math.min(beta, bestValue);
            if (beta <= alpha) break;
        }
        var result = { value: bestValue, move: bestMove };
        transpositionTable[fen] = { depth: depth, data: result };
        return result;
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

function getPieceValue(piece, x, y) {
    if (piece === null) return 0;
    var getAbsoluteValue = function (piece, x, y) {
        if (piece.type === 'p') return 10 + (piece.color === 'w' ? pawnEvalWhite[x][y] : pawnEvalBlack[x][y]);
        else if (piece.type === 'r') return 50 + (piece.color === 'w' ? rookEvalWhite[x][y] : rookEvalBlack[x][y]);
        else if (piece.type === 'n') return 30 + knightEval[x][y];
        else if (piece.type === 'b') return 30 + (piece.color === 'w' ? bishopEvalWhite[x][y] : bishopEvalBlack[x][y]);
        else if (piece.type === 'q') return 90 + evalQueen[x][y];
        else if (piece.type === 'k') return 900 + (piece.color === 'w' ? kingEvalWhite[x][y] : kingEvalBlack[x][y]);
        throw "Unknown piece type: " + piece.type;
    };
    var absoluteValue = getAbsoluteValue(piece, x, y);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
}

function onDrop(source, target) {
  var move = game.move({ from: source, to: target, promotion: 'q' });
  if (move === null) return 'snapback';
  updateStatus();
  if (gameMode === 'pva' && !game.game_over()) {
    window.setTimeout(makeAIMove, 250);
  }
}

function onSnapEnd() { board.position(game.fen()); }

function updateStatus() {
  var status = '';
  var moveColor = game.turn() === 'b' ? 'Negro' : 'Blanco';
  if (game.in_checkmate()) {
    status = 'Juego terminado, ' + moveColor + ' está en jaque mate.';
    if (gameMode === 'pva') {
        if (game.turn() === 'b') GameManager.showResult('win'); else GameManager.showResult('loss');
    }
  } else if (game.in_draw()) {
    status = 'Juego terminado, posición de tablas';
    if (gameMode === 'pva') GameManager.saveResult('draw');
  } else {
    status = 'Turno de: ' + moveColor;
    if (game.in_check()) status += ', ' + moveColor + ' está en jaque';
  }
  $status.html(status);
  $fen.html(game.fen());
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};
board = Chessboard('board', config);
GameManager.setGame('chess', difficulty);
updateStatus();

$('#reset-btn').on('click', function() {
    game.reset(); board.start(); transpositionTable = {}; updateStatus();
});
$('#undo-btn').on('click', function() {
    game.undo(); if (gameMode === 'pva') game.undo();
    board.position(game.fen()); updateStatus();
});
$('#game-mode').on('change', function() {
    gameMode = $(this).val(); $('#difficulty').toggle(gameMode === 'pva');
    game.reset(); board.start(); transpositionTable = {}; updateStatus();
});
$('#difficulty').on('change', function() { difficulty = $(this).val(); });
