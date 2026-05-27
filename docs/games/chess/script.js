var board = null;
var game = new Chess();
var $status = $('#status');
var $fen = $('#fen');
var gameMode = 'pvp';
var difficulty = 'easy';

function onDragStart(source, piece, position, orientation) {
  if (game.game_over()) return false;

  // only pick up pieces for the player whose turn it is
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }

  // If Vs IA, player can only move white
  if (gameMode === 'pva' && game.turn() === 'b') return false;
}

function makeRandomMove() {
  var possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  var randomIdx = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIdx]);
  board.position(game.fen());
  updateStatus();
}

function makeAIMove() {
  if (game.game_over()) return;

  var depth = 1;
  if (difficulty === 'medium') depth = 2;
  if (difficulty === 'hard') depth = 3;

  var move = getBestMove(game, depth);
  game.move(move);
  board.position(game.fen());
  updateStatus();
}

function getBestMove(game, depth) {
    if (difficulty === 'easy') {
        var possibleMoves = game.moves();
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }
    return minimaxChess(game, depth, -10000, 10000, true).move;
}

function minimaxChess(game, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || game.game_over()) {
        return { value: evaluateBoard(game.board()) };
    }

    var moves = game.moves();
    var bestMove = null;

    if (isMaximizing) {
        var bestValue = -9999;
        for (var i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            var val = minimaxChess(game, depth - 1, alpha, beta, !isMaximizing).value;
            game.undo();
            if (val > bestValue) {
                bestValue = val;
                bestMove = moves[i];
            }
            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) break;
        }
        return { value: bestValue, move: bestMove };
    } else {
        var bestValue = 9999;
        for (var i = 0; i < moves.length; i++) {
            game.move(moves[i]);
            var val = minimaxChess(game, depth - 1, alpha, beta, !isMaximizing).value;
            game.undo();
            if (val < bestValue) {
                bestValue = val;
                bestMove = moves[i];
            }
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
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
        }
    }
    return totalEvaluation;
}

function getPieceValue(piece) {
    if (piece === null) return 0;
    var getAbsoluteValue = function (piece) {
        if (piece.type === 'p') return 10;
        else if (piece.type === 'r') return 50;
        else if (piece.type === 'n') return 30;
        else if (piece.type === 'b') return 30;
        else if (piece.type === 'q') return 90;
        else if (piece.type === 'k') return 900;
        throw "Unknown piece type: " + piece.type;
    };
    var absoluteValue = getAbsoluteValue(piece);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
}

function onDrop(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return 'snapback';

  updateStatus();

  // make move for black if vs IA
  if (gameMode === 'pva' && !game.game_over()) {
    window.setTimeout(makeAIMove, 250);
  }
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}

function updateStatus() {
  var status = '';

  var moveColor = 'Blanco';
  if (game.turn() === 'b') {
    moveColor = 'Negro';
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Juego terminado, ' + moveColor + ' está en jaque mate.';
  }
  // draw?
  else if (game.in_draw()) {
    status = 'Juego terminado, posición de tablas';
  }
  // game still on
  else {
    status = 'Turno de: ' + moveColor;
    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' está en jaque';
    }
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

updateStatus();

$('#reset-btn').on('click', function() {
    game.reset();
    board.start();
    updateStatus();
});

$('#undo-btn').on('click', function() {
    game.undo();
    if (gameMode === 'pva') game.undo(); // Undo AI move too
    board.position(game.fen());
    updateStatus();
});

$('#game-mode').on('change', function() {
    gameMode = $(this).val();
    $('#difficulty').toggle(gameMode === 'pva');
    game.reset();
    board.start();
    updateStatus();
});

$('#difficulty').on('change', function() {
    difficulty = $(this).val();
});
