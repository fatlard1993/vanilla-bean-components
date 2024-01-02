import { throttle } from '../../utils/data';
import { DomElem } from '../DomElem';
import context from '../context';

const defaultOptions = {
	tag: 'canvas',
	background: '#FFF',
	color: '#000',
	lineWidth: 3,
	width: '200px',
	height: '200px',
};

export default class Whiteboard extends DomElem {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				styles: (theme, domElem) => `
					cursor: crosshair;

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);
	}

	render() {
		this.canvas = this.elem.getContext('2d');

		super.render();

		document.addEventListener('mousedown', this.onPointerDown.bind(this));
		document.addEventListener('touchstart', this.onPointerDown.bind(this));
	}

	setOption(key, value) {
		if (key === 'width' || key === 'height') {
			this.elem[key] = Number.parseInt(value);
			this.elem.style[key] = value;
		} else if (key === 'lines') value.forEach(line => this.drawLine(line));
		else if (key === 'background') this.elem.style[key] = value;
		else super.setOption(key, value);
	}

	normalizePosition(event, offsetX = 0, offsetY = 0) {
		if (!event.targetTouches) return { x: event.offsetX - offsetX, y: event.offsetY - offsetY };

		const rect = event.target.getBoundingClientRect();
		const x = event.targetTouches[0].clientX - rect.x - offsetX;
		const y = event.targetTouches[0].clientY - rect.y - offsetY;

		return { x, y };
	}

	onPointerDown(event) {
		if (context.domElem.isTouchDevice && !event.targetTouches) return;

		if (event.target === this.elem) {
			const onMove = throttle(this.onMove.bind(this), 6);

			const onDrop = () => {
				this.elem.removeEventListener('mouseup', onDrop);
				this.elem.removeEventListener('mouseout', onDrop);
				this.elem.removeEventListener('mousemove', onMove);
				this.elem.removeEventListener('touchend', onDrop);
				this.elem.removeEventListener('touchcancel', onDrop);
				this.elem.removeEventListener('touchmove', onMove);

				this.canvas.closePath();

				if (this.line.length === 0) return;

				this.dispatchEvent(
					new CustomEvent('change', {
						detail: { color: this.options.color, width: this.options.lineWidth, line: this.line },
					}),
				);
			};

			this.elem.addEventListener('mouseup', onDrop);
			this.elem.addEventListener('mouseout', onDrop);
			this.elem.addEventListener('mousemove', onMove);
			this.elem.addEventListener('touchend', onDrop);
			this.elem.addEventListener('touchcancel', onDrop);
			this.elem.addEventListener('touchmove', onMove);

			const { x, y } = this.normalizePosition(event);

			this.x = x;
			this.y = y;
			this.line = [];
		}
	}

	onMove(event) {
		event.preventDefault();

		this.drawEvent(event);
	}

	drawEvent(event, cap) {
		const { x, y } = this.normalizePosition(event);

		this.line.push({ x, y });

		this.canvas.strokeStyle = this.options.color;
		this.canvas.lineWidth = this.options.lineWidth;
		this.canvas.lineJoin = 'round';
		this.canvas.lineCap = 'round';

		this.canvas.beginPath();
		this.canvas.moveTo(this.x, this.y);
		this.canvas.lineTo(x, y);
		this.canvas.stroke();
		if (cap) this.canvas.closePath();

		this.x = x;
		this.y = y;
	}

	drawLine({ color, width, line }) {
		if (line.length === 0) return;

		this.canvas.strokeStyle = color;
		this.canvas.lineWidth = width;
		this.canvas.lineJoin = 'round';
		this.canvas.lineCap = 'round';

		this.canvas.beginPath();
		this.canvas.moveTo(line[0].x, line[0].y);
		line.forEach(({ x, y }) => this.canvas.lineTo(x, y));
		this.canvas.stroke();
		this.canvas.closePath();
	}

	onChange(callback) {
		this.addEventListener('change', callback);

		return () => this.removeEventListener('change', callback);
	}

	empty() {
		this.canvas.clearRect(0, 0, this.elem.width, this.elem.height);
	}
}
