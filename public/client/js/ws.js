let ws;
let reconnectInterval;
const playerName = 'GodXero';
const protocol = window.location.protocol;
const host = window.location.host;

class GameConnectionHandler {
	constructor (game) {
		this.game = game;
	}
}

function connectWebSocket () {
	ws = new WebSocket(`ws${protocol === 'https:' ? 's' : ''}://${host}?name=${playerName}`);

	ws.addEventListener('open', () => {
		console.log('WebSocket opened');
	});

	ws.addEventListener('message', (event) => {
		console.log('Message received:', JSON.parse(event.data));
	});

	ws.addEventListener('close', () => {
		console.log('WebSocket closed.');
	});

	ws.addEventListener('error', (error) => {
		console.log('WebSocket error:', error);
	});
}

function startReconnect () {
	reconnectInterval = setInterval(() => {
		if (ws.readyState === WebSocket.CLOSED) {
			console.log('Reconnecting WebSocket...');
			connectWebSocket();
		}
	}, 2000);
}

function initEvents () {
	window.addEventListener('click', () => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ message: 'Hello' }));
		} else {
			console.log('WebSocket is not open, message not sent.');
		}

		fetch(`${protocol}//${host}/game-data`, {
			method: 'POST',
			body: JSON.stringify({ game: true }),
			headers: { 'Content-Type': 'application/json' }
		}).then(res => res.json()).then(mg => console.log(mg)).catch(error => console.error(error));
	});
}

function init () {
	connectWebSocket();
	startReconnect();
	initEvents();
}

window.addEventListener('DOMContentLoaded', init);
