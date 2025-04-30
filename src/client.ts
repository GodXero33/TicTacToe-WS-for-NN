import WebSocket from "ws";
import Room from "./room";
import WEBSOCKET_PROTOCOL_CODES from "./protocol";

export default class Client {
	private ws!: WebSocket;
	private name!: string;
	private room!: Room;
	private symbol!: number;

	constructor (ws: WebSocket, name: string | null, room: Room) {
		this.ws = ws;

		if (!name) name = Client.randomName();

		this.name = name;
		this.room = room;

		this.ws.addEventListener('message', (event: WebSocket.MessageEvent) => {
			const data = JSON.parse(event.data as string);
			console.log(`${this.name}:\n${event.data}`);

			if (!data || !data.code === undefined) return;

			if (data.code === WEBSOCKET_PROTOCOL_CODES.START_ACCEPTED) {
				this.room.gameStartAccept(this);
				return;
			}

			if (data.code === WEBSOCKET_PROTOCOL_CODES.MOVE) {
				this.room.requestMove(this, data.cell[0], data.cell[1]);
				return;
			}
		});

		this.ws.addEventListener('close', () => {
			this.room.close();
		});
	}

	public setSymbol (symbol: number) {
		if (symbol == 1 || symbol == 2) {
			this.symbol = symbol;
		}
	}

	public getSymbol (): number {
		return this.symbol;
	}

	public getName (): string {
		return this.name;
	}

	public send (message: any) {
		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message));
			return;
		}

		console.log('Websocket is not opened');
	}

	public close (): void {
		if (this.ws.readyState !== WebSocket.CLOSED) this.ws.close();
	}

	private static randomName (): string {
		const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
		let name = '';
		let len = Math.floor(Math.random() * 4) + 4;

		for (let a = 0; a < len; a++)
			name += letters[Math.floor(Math.random() * letters.length)]

		return name;
	}
}
