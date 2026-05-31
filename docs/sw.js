const CACHE_NAME = 'gamehub-v1';
const ASSETS = [
  './',
  'index.html',
  'login.html',
  'scores.html',
  'adminUsuarios.html',
  'css/style.css',
  'js/config.js',
  'js/auth.js',
  'js/ui-manager.js',
  'js/game-manager.js',
  'js/main.js',
  'lib/supabase.js',
  'lib/jquery.min.js',
  'lib/chess.min.js',
  'lib/chessboard.min.js',
  'lib/chessboard.min.css',
  'lib/fonts/roboto.css',
  'lib/fonts/material-icons.css',
  'lib/fonts/files/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3-UBGEe.woff2',
  'lib/fonts/files/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3CUBGEe.woff2',
  'lib/fonts/files/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3GUBGEe.woff2',
  'lib/fonts/files/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3KUBGEe.woff2',
  'lib/fonts/files/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3OUBGEe.woff2',
  'lib/fonts/files/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3iUBGEe.woff2',
  'lib/fonts/files/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBA.woff2',
  'lib/fonts/files/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMawCUBGEe.woff2',
  'lib/fonts/files/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMaxKUBGEe.woff2',
  'lib/fonts/files/flUhRq6tzZclQEJ-Vdg-IuiaDsNZ.ttf',
  'assets/icon.svg',
  'assets/chess/bB.png',
  'assets/chess/bK.png',
  'assets/chess/bN.png',
  'assets/chess/bP.png',
  'assets/chess/bQ.png',
  'assets/chess/bR.png',
  'assets/chess/wB.png',
  'assets/chess/wK.png',
  'assets/chess/wN.png',
  'assets/chess/wP.png',
  'assets/chess/wQ.png',
  'assets/chess/wR.png',
  'games/chess/ajedrez.html',
  'games/chess/script.js',
  'games/sudoku/sudoku.html',
  'games/sudoku/script.js',
  'games/tictactoe/tictactoe.html',
  'games/tictactoe/script.js',
  'games/memory/memoria.html',
  'games/memory/script.js',
  'games/sliding/rompecabezas.html',
  'games/sliding/script.js',
  'games/connect4/conecta4.html',
  'games/connect4/script.js',
  'games/simon/simon.html',
  'games/simon/script.js',
  'games/hangman/ahorcado.html',
  'games/hangman/script.js',
  'games/hanoi/hanoi.html',
  'games/hanoi/script.js'
];

// Add font files and chess pieces
// (In a real sw we might dynamic cache, but let's be thorough for offline)

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Strategy: Cache First, falling back to Network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(response => {
           // Don't cache supabase/cloudinary calls here to avoid issues,
           // just return them. Static assets are already in ASSETS.
           return response;
        });
      })
  );
});
