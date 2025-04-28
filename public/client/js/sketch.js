import TicTacToeGame from "./tic-tac-toe-game.js";
import GameConnectionHandler from "./ws.js";

const canvas = document.getElementById('game-canvas');
const game = new TicTacToeGame(canvas);
const gameConnectionHandler = new GameConnectionHandler(game);

window.addEventListener('DOMContentLoaded', () => {
	gameConnectionHandler.init();
});

console.log(gameConnectionHandler);
