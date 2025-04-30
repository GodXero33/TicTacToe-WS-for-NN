import TicTacToeGame from './tic-tac-toe-game.js';
import GameConnectionHandler from './ws.js';

let inDev = true;

const canvas = document.getElementById('game-canvas');
const gameConnectionHandler = new GameConnectionHandler();
const game = new TicTacToeGame(canvas, gameConnectionHandler);

window.addEventListener('DOMContentLoaded', () => {
	const playerNameField = document.getElementById('player-name-field');

	if (inDev) {
		const animalNames = ['angry-tiger', 'happy-penguin', 'sneaky-fox', 'lazy-panda', 'funky-zebra', 'sleepy-otter', 'spicy-sloth', 'chill-lynx', 'jumpy-koala', 'clever-owl', 'sassy-giraffe', 'bouncy-bison', 'curious-meerkat', 'grumpy-raccoon', 'cheeky-panther', 'nerdy-hedgehog', 'witty-wolf', 'moody-flamingo', 'zany-crocodile', 'swift-kangaroo'];
		playerNameField.value = animalNames[Math.floor(Math.random() * animalNames.length)];
	}

	document.getElementById('join-btn').addEventListener('click', () => {
		if (playerNameField.value.length < 4) {
			alert('Player name must be at least 4 characters long');
			return;
		}

		gameConnectionHandler.init(playerNameField.value);
		document.getElementById('menu-cont').classList.add('hide');
	});
});

console.log(game);
