import { throttle } from '../../utils/data';
import { Component } from '../../Component';

const defaultOptions = {
	tag: 'canvas',
	background: '#FFF',
	color: '#000',
	lineWidth: 3,
	width: '200px',
	height: '200px',
	readOnly: false,
	registeredEvents: new Set(['line', 'draw']),
};

/**
 * Interactive drawing canvas component with multi-touch support and line rendering.
 *
 * Provides a drawing surface with pointer event handling, configurable drawing settings,
 * and the ability to render predefined lines. Supports multiple simultaneous drawing pointers.
 * @param {object} [options={}] - Whiteboard configuration options
 * @param {string} [options.tag='canvas'] - HTML tag, uses canvas element
 * @param {string} [options.background='#FFF'] - Canvas background color
 * @param {string} [options.color='#000'] - Default drawing color
 * @param {number} [options.lineWidth=3] - Default line width for drawing
 * @param {string} [options.width='200px'] - Canvas width
 * @param {string} [options.height='200px'] - Canvas height
 * @param {boolean} [options.readOnly=false] - Whether drawing is disabled
 * @param {Array<object>} [options.lines] - Predefined lines to render on the canvas
 * @param {number} [options.drawThrottle] - Custom throttle delay for draw events
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Whiteboard} Whiteboard component instance
 */
export default class Whiteboard extends Component {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				style: {
					cursor: 'crosshair',
					touchAction: 'none',
					borderRadius: '3px',
					...options.style,
				},
			},
			...children,
		);
	}

	build() {
		this.canvas = this.elem.getContext('2d');

		this.pointers = {};

		const boundInteractionInit = this.interactionInit.bind(this);
		this.elem.addEventListener('pointerdown', boundInteractionInit);
		this.replaceCleanup('pointerdown', () => this.elem.removeEventListener('pointerdown', boundInteractionInit));
	}

	static handlers = {
		width(value) {
			this.elem.width = Number.parseInt(value);
			this.elem.style.width = value;
		},
		height(value) {
			this.elem.height = Number.parseInt(value);
			this.elem.style.height = value;
		},
		lines(value) {
			value.forEach(line => this.drawLine(line));
		},
		background(value) {
			this.elem.style.background = value;
		},
	};

	getPosition({ offsetX, offsetY }) {
		return { x: offsetX.toFixed(3), y: offsetY.toFixed(3) };
	}

	interactionInit(event) {
		if (this.options.readOnly) return;

		event.preventDefault();

		const { pointerId } = event;
		const { x, y } = this.getPosition(event);

		this.pointers[pointerId] = { x, y, line: [{ x, y }] };

		this.activePointerCount = Object.values(this.pointers).filter(_ => !!_).length;

		if (this.pointerInteracting) return;

		this.pointers[pointerId].initiator = true;
		this.pointerInteracting = true;

		const move = throttle(
			(event => {
				if (this.options.readOnly || !this.pointers[event.pointerId]) return;

				event.preventDefault();

				this.drawEvent.call(this, event);
			}).bind(this),
			this.options.drawThrottle || Math.max(Math.min(this.options.lineWidth + 3, 24), 6),
		);
		const removePointer = event => {
			if (!this.pointers[event.pointerId]) return;

			event.preventDefault();

			this.emit('line', {
				event,
				color: this.options.color,
				width: this.options.lineWidth,
				line: this.pointers[event.pointerId].line,
			});

			if (this.pointers[event.pointerId].line.length === 0) this.drawEvent(event, true);

			delete this.pointers[event.pointerId];
			this.activePointerCount = Object.values(this.pointers).filter(_ => !!_).length;

			if (this.activePointerCount === 0) {
				this.pointerInteracting = false;

				document.removeEventListener('pointermove', move);
				document.removeEventListener('pointerup', removePointer);
				document.removeEventListener('pointerleave', removePointer);
				document.removeEventListener('pointercancel', removePointer);
			}
		};

		document.addEventListener('pointermove', move);
		document.addEventListener('pointerup', removePointer);
		document.addEventListener('pointerleave', removePointer);
		document.addEventListener('pointercancel', removePointer);

		this.replaceCleanup('gestureListeners', () => {
			document.removeEventListener('pointermove', move);
			document.removeEventListener('pointerup', removePointer);
			document.removeEventListener('pointerleave', removePointer);
			document.removeEventListener('pointercancel', removePointer);
		});
	}

	drawEvent(event, cap = false) {
		const { pointerId } = event;

		if (!this.pointers[pointerId]) return;

		const to = this.getPosition(event);
		const { x, y } = this.pointers[pointerId];
		const from = { x, y };

		this.drawLine({ color: this.options.color, width: this.options.lineWidth, line: [from, to], cap });

		this.pointers[pointerId].line.push(to);

		this.emit('draw', { event, cap, from, to });

		this.pointers[pointerId].x = to.x;
		this.pointers[pointerId].y = to.y;
	}

	/**
	 * Draws a line on the canvas with specified properties.
	 * @param {object} options - Line drawing options
	 * @param {string} options.color - Line color
	 * @param {number} options.width - Line width
	 * @param {Array<object>} options.line - Array of {x, y} points defining the line
	 * @param {boolean} [options.cap] - Whether to close the path after drawing
	 */
	drawLine({ color, width, line, cap = true }) {
		if (line.length === 0) return;

		this.canvas.strokeStyle = color;
		this.canvas.lineWidth = width;
		this.canvas.lineJoin = 'round';
		this.canvas.lineCap = 'round';

		this.canvas.beginPath();
		this.canvas.moveTo(line[0].x, line[0].y);
		line.forEach(({ x, y }) => this.canvas.lineTo(x, y));
		this.canvas.stroke();
		if (cap) this.canvas.closePath();
	}

	/**
	 * Clears the entire canvas.
	 */
	clearCanvas() {
		this.canvas.clearRect(0, 0, this.elem.width, this.elem.height);
	}
}
