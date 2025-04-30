const WEBSOCKET_PROTOCOL_CODES = {
	'START_REQUEST': 0,
	'START_ACCEPTED': 1,
	'PLAYER_CHANCE': 2,
	'WAIT_FOR_OPPONENT': 3,
	'MOVE': 4,
	'MOVE_BACK': 5
};

export default class GameConnectionHandler {
	constructor () {
		this.ws = null;
		this.playerName = null;
		this.player = null;
		this.roomId = null;
		this.game = null;
		this.opponent = null;
		this.initialized = false;
		this.playerChance = false;
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
		try {
			const data = JSON.parse(event.data);
			console.log(data);

			if (!data || !data.code === undefined) return;

			if (data.code === WEBSOCKET_PROTOCOL_CODES.START_REQUEST) {
				this.player = data.player;
				this.roomId = data.roomId;
				this.opponent = data.opponentName;

				this.send({
					code: WEBSOCKET_PROTOCOL_CODES.START_ACCEPTED
				});

				return;
			}

			if (data.code === WEBSOCKET_PROTOCOL_CODES.PLAYER_CHANCE) {
				alert('Your turn');
				this.playerChance = true;
				return;
			}

			if (data.code === WEBSOCKET_PROTOCOL_CODES.WAIT_FOR_OPPONENT) {
				alert('Wait opponent move');
				this.playerChance = false;
				return;
			}

			if (data.code === WEBSOCKET_PROTOCOL_CODES.MOVE) {
				this.game.onServerClick(data.cell[0], data.cell[1], this.player);
				return;
			}

			if (data.code === WEBSOCKET_PROTOCOL_CODES.MOVE_BACK) {
				this.game.onServerClick(data.cell[0], data.cell[1], this.player == 1 ? 2 : 1);
				alert('Your turn');

				this.playerChance = true;
			}
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

	init (playerName) {
		if (this.initialized) return;

		this.playerName = playerName;
		this.initialized = true;

		this.#connectWebSocket();

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
				message.player = this.playerName;
				message.roomId = this.roomId;
				this.ws.send(JSON.stringify(message));
				resolve();
			} else {
				reject();
			}
		});
	}

	click (x, y) {
		this.send({
			code: WEBSOCKET_PROTOCOL_CODES.MOVE,
			cell: [x, y]
		});

		this.playerChance = false;
	}
}
