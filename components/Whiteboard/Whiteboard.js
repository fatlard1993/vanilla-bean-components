import { throttle } from '../../utils/data';
import { Component } from '../Component';

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

export default class Whiteboard extends Component {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				styles: (theme, component) => `
					cursor: crosshair;
					touch-action: none;
					border-radius: 3px;

					${options.styles?.(theme, component) || ''}
				`,
			},
			...children,
		);
	}

	render() {
		this.canvas = this.elem.getContext('2d');

		super.render();

		this.pointers = {};

		this.elem.addEventListener('pointerdown', this.interactionInit.bind(this));
	}

	setOption(key, value) {
		if (key === 'width' || key === 'height') {
			this.elem[key] = Number.parseInt(value);
			this.elem.style[key] = value;
		} else if (key === 'lines') value.forEach(line => this.drawLine(line));
		else if (key === 'background') this.elem.style[key] = value;
		else super.setOption(key, value);
	}

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
			this.options.drawThrottle || Math.min(Math.max(this.options.lineWidth + 3, 24), 6),
		);
		const removePointer = event => {
			if (!this.pointers[event.pointerId]) return;

			event.preventDefault();

			this.emit('line', {
				event,
				color: this.options.color,
				width: this.options.lineWidth,
				line: this.pointers[pointerId].line,
			});

			if (this.pointers[pointerId].line.length === 0) this.drawEvent(event, true);

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
	}

	drawEvent(event, cap = false) {
		const { pointerId } = event;

		const to = this.getPosition(event);
		const { x, y } = this.pointers[pointerId];
		const from = { x, y };

		this.drawLine({ color: this.options.color, width: this.options.lineWidth, line: [from, to], cap });

		this.pointers[pointerId].line.push(to);

		this.emit('draw', { event, cap, from, to });

		this.pointers[pointerId].x = to.x;
		this.pointers[pointerId].y = to.y;
	}

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

	empty() {
		this.canvas.clearRect(0, 0, this.elem.width, this.elem.height);
	}
}
