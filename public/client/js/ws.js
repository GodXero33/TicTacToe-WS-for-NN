const WEBSOCKET_PROTOCOL_CODES = {
	'START_REQUEST': 0,
	'START_ACCEPTED': 1
};

export default class GameConnectionHandler {
	constructor () {
		this.ws = null;
		this.playerName = 'GodXero';
		this.player = 1;
		this.roomId = '1234';
		this.game = null;
	}

	#connectWebSocket () {
		const protocol = window.location.protocol;
		const host = window.location.host;

		this.ws = new WebSocket(`ws${protocol === 'https:' ? 's' : ''}://${host}?name=${this.playerName}`);

		this.ws.addEventListener('open', this.#onopen.bind(this));
		this.ws.addEventListener('message', this.#onmessage.bind(this));
		this.ws.addEventListener('close', this.#onclose.bind(this));
		this.ws.addEventListener('error', this.#onerror.bind(this));
	}

	#onopen () {
		console.log('WebSocket opened');
	}

	#onmessage (event) {
		console.log('Message received:', JSON.parse(event.data));

		try {
			const data = JSON.parse(event.data);

			if (!data || !data.code) return;

			if (data.code === WEBSOCKET_PROTOCOL_CODES['START_REQUEST']) {
				console.log(data);
				this.send({
					code: WEBSOCKET_PROTOCOL_CODES['START_ACCEPTED']
				});
			}

			// if (data.code === 'move') {
			// 	if (!this.game) return;

			// 	this.game.onServerClick(data.move.x, data.move.y, data.player);
			// }
		} catch (error) {
			console.error(error);
		}
	}

	#onclose () {
		console.log('WebSocket closed.');
	}

	#onerror (error) {
		console.log('WebSocket error:', error);
	}

	#initEvents () {
		window.addEventListener('click', () => {
			if (this.ws && this.ws.readyState === WebSocket.OPEN) {
				this.ws.send(JSON.stringify({ message: 'Hello' }));
			} else {
				console.log('WebSocket is not open, message not sent.');
			}

			const protocol = window.location.protocol;
			const host = window.location.host;

			fetch(`${protocol}//${host}/game-data`, {
				method: 'POST',
				body: JSON.stringify({ game: true }),
				headers: { 'Content-Type': 'application/json' }
			}).then(res => res.json()).then(mg => console.log(mg)).catch(error => console.error(error));
		});
	}

	init () {
		this.#connectWebSocket();
		// this.#initEvents();

		const reconnectInterval = setInterval(() => {
			if (this.ws.readyState === WebSocket.CLOSED) {
				console.log('Reconnecting WebSocket...');
				this.#connectWebSocket();
			}
		}, 2000);

		Object.defineProperty(this, 'reconnectInterval', {
			value: reconnectInterval,
			writable: false,
			configurable: false,
			enumerable: true
		});
	}

	send (message) {
		return new Promise((resolve, reject) => {
			if (this.ws && this.ws.readyState === WebSocket.OPEN) {
				message.player = this.player;
				message.roomId = this.roomId;
				this.ws.send(JSON.stringify(message));
				resolve();
			} else {
				reject();
			}
		});
	}
}
