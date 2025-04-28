import GameConnectionHandler from "./ws.js";

const gameConnectionHandler = new GameConnectionHandler(null);

window.addEventListener('DOMContentLoaded', () => {
	gameConnectionHandler.init();
});

console.log(gameConnectionHandler);
