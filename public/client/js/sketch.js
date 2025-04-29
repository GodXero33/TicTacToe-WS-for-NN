import TicTacToeGame from "./tic-tac-toe-game.js";
import GameConnectionHandler from "./ws.js";

const canvas = document.getElementById('game-canvas');
const gameConnectionHandler = new GameConnectionHandler();
const game = new TicTacToeGame(canvas, gameConnectionHandler);

window.addEventListener('DOMContentLoaded', () => {
	gameConnectionHandler.init();
});

console.log(game);
