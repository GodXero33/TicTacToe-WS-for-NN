"use strict";

export default class GameConnectionHandler {
	constructor (game) {
		this.game = game;
		this.ws = null;
		this.playerName = 'GodXero';
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
		this.#initEvents();

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
}
