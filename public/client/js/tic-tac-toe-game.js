export default class TicTacToeGame {
	constructor (canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		this.width = 0;
		this.height = 0;

		this.grid = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 0));

		this.grid[1][1] = 1;
		this.grid[2][2] = 2;

		this.cellSize = 0;

		this.#init();
	}

	#init () {
		const resizeObserver = new ResizeObserver(entries => {
			entries.forEach(entry => {
				if (entry.target !== this.canvas) return;

				this.width = this.canvas.offsetWidth;
				this.height = this.canvas.offsetHeight;

				this.canvas.width = this.width;
				this.canvas.height = this.height;

				this.cellSize = this.width / 3;

				this.ctx.lineWidth = this.width * 0.01;
				this.ctx.lineCap = 'round';

				this.#draw();
			});
		});

		resizeObserver.observe(this.canvas);

		this.#animate();
	}

	#update () {}

	#drawGrid () {
		this.ctx.strokeStyle = '#ffffff';

		this.ctx.beginPath();

		for (let a = 1; a < 3; a++) {
			this.ctx.moveTo(this.cellSize * a, 0);
			this.ctx.lineTo(this.cellSize * a, this.height);

			this.ctx.moveTo(0, this.cellSize * a);
			this.ctx.lineTo(this.width, this.cellSize * a);
		}

		this.ctx.stroke();
	}

	#drawSymbols () {
		const scale = 0.7;

		this.grid.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell == 0) return;

				this.ctx.beginPath();
				this.ctx.save();
				this.ctx.translate(this.cellSize * (x + 0.5), this.cellSize * (y + 0.5), this.cellSize * 0.5);
				this.ctx.scale(scale, scale);

				if (cell == 1) {
					this.ctx.strokeStyle = '#00f';

					this.ctx.moveTo(-this.cellSize * 0.5, -this.cellSize * 0.5);
					this.ctx.lineTo(this.cellSize * 0.5, this.cellSize * 0.5);
					this.ctx.moveTo(this.cellSize * 0.5, -this.cellSize * 0.5);
					this.ctx.lineTo(-this.cellSize * 0.5, this.cellSize * 0.5);
				} else {
					this.ctx.strokeStyle = '#f00';

					this.ctx.arc(0, 0, this.cellSize * 0.5, Math.PI * 2, false);
				}

				this.ctx.stroke();
				this.ctx.restore();
			})
		});
	}

	#draw () {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.#drawGrid();
		this.#drawSymbols();
	}

	#animate () {
		this.#update();
		this.#draw();
		window.requestAnimationFrame(this.#animate.bind(this));
	}
}
