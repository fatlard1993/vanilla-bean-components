import { TinyColor, random as randomColor } from '@ctrl/tinycolor';
import Sketchy from 'moresketchy';

import {
	DomElem,
	Button,
	Whiteboard,
	Popover,
	ColorPicker,
	Input,
	context,
	randInt,
	randFromArray,
	deltaE,
} from '../..';

import DemoView, { DemoWrapper } from '../DemoView';

const CANVAS_SIZE = 400;

function getMinMax(property, points) {
	const values = points.map(point => point[property]);

	return { min: Math.min(...values), max: Math.max(...values) };
}

function getMiddle(property, points) {
	const { min, max } = getMinMax(property, points);

	return (min + max) / 2;
}

function findCenter(points) {
	return { x: getMiddle('x', points), y: getMiddle('y', points) };
}

const findSize = points => {
	const x = getMinMax('x', points);
	const y = getMinMax('y', points);

	return { x: x.max - x.min, y: y.max - y.min };
};

// const dot = ({ color = '#000', width = 6, position = 100 } = {}) => ({
// 	color,
// 	width,
// 	line: [{ x: position, y: position }],
// });

const triangle = ({ color = '#000', width = 6, size = 100, position = 100 } = {}) => {
	size /= 2;
	const top = { x: position, y: position - size };
	const bottomLeft = { x: position - size, y: position + size };
	const bottomRight = { x: position + size, y: position + size };

	return { color, width, position, size, line: [top, bottomLeft, bottomRight, top] };
};

const square = ({ color = '#000', width = 6, size = 100, position = 100 } = {}) => {
	size /= 2;
	const topLeft = { x: position - size, y: position - size };
	const topRight = { x: position + size, y: position - size };
	const bottomLeft = { x: position - size, y: position + size };
	const bottomRight = { x: position + size, y: position + size };

	return { color, width, position, size, line: [topLeft, topRight, bottomRight, bottomLeft, topLeft] };
};

const shapes = { square, triangle };

const randomShape = ({
	color = randomColor().toRgbString(),
	width = randInt(1, 21),
	shape = shapes[randFromArray(Object.keys(shapes))],
	slop = 30,
	size = randInt(width * 4, 300),
	position = randInt(size, CANVAS_SIZE - size),
} = {}) => {
	size /= 2;

	const { line } = shape({ size, position });

	if (slop === 0) return { color, width, line };

	slop = Math.min(size * (slop / 100), size / 2);

	const randPosition = current => ({ x: current.x + randInt(-slop, slop), y: current.y + randInt(-slop, slop) });
	const points = line.slice(0, -1).map(randPosition);

	return { color, width, position, size, line: [...points, points[0]] };
};

class ShapeMatchGame extends DomElem {
	constructor() {
		super({
			inkLevel: 100,
			color: '#000',
			lineWidth: 3,
			styles: () => `
				height: 100%;
				display: flex;
				flex-direction: column;
				position: relative;
			`,
		});
	}

	render() {
		this._score = new DomElem();
		this._time = new DomElem();
		this._playPause = new Button(
			{ onPointerPress: () => (this.options.paused = !(this.options.paused ?? true)) },
			'Play',
		);
		this._whiteboard = new Whiteboard({
			width: `${CANVAS_SIZE}px`,
			height: `${CANVAS_SIZE}px`,
			color: this.options.subscriber('color'),
			background: context.domElem.theme.colors.white,
			lineWidth: this.options.subscriber('lineWidth'),
			readOnly: this.options.subscriber('inkLevel', inkLevel => inkLevel <= 0),
			style: { margin: '12px auto' },
			onDraw: ({ detail: { from, to } }) => {
				const length = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
				const inkUse = (length || this.options.lineWidth) * this.options.lineWidth * 0.0005;

				this.options.inkLevel -= inkUse;
			},
			onChange: ({ detail: { line } }) => {
				if (!this.shape) return;

				const shapeSize = findSize(line);
				const responseTime = performance.now() - this.startTime;
				const lineWidthDelta = Math.abs(this.shape.width - this.options.lineWidth);
				const colorDelta = deltaE(
					Object.values(new TinyColor(this.shape.color).toRgb()).slice(0, -1),
					Object.values(new TinyColor(this.options.color).toRgb()).slice(0, -1),
				);
				const shapeDelta = Sketchy.shapeContextMatch([line], [this.shape.line], false);
				const positionDelta =
					Math.abs(findCenter(line).x - this.shape.position) + Math.abs(findCenter(line).y - this.shape.position);
				const sizeDelta = Math.abs(shapeSize.x - this.shape.size) + Math.abs(shapeSize.y - this.shape.size);

				const lineWidthPoints = lineWidthDelta > 4 ? 50 - lineWidthDelta : 200 - 50 * lineWidthDelta;
				const colorPoints = 200 - colorDelta * 6;
				const shapePoints = shapeDelta > 0.2 ? 100 * (1 + shapeDelta) : -(16 / shapeDelta);
				const positionPoints = 100 - positionDelta;
				const sizePoints = 100 - sizeDelta;
				const responsePoints = (16000 - responseTime) * 0.011;

				this.options.score += Math.round(
					lineWidthPoints + colorPoints + shapePoints + positionPoints + sizePoints + responsePoints,
				);

				this.newShape();
			},
		});
		this._inkwell = new DomElem({
			tag: 'progress',
			styles: () => `
				transform-origin: 0 100%;
				transform: rotate(-90deg);
				position: absolute;
				bottom: 88px;
				left: 6px;
				height: 12px;
				width: 300px;
			`,
			style: this.options.subscriber('color', accentColor => ({ accentColor })),
			max: 100,
			value: this.options.subscriber('inkLevel'),
		});

		const colorPicker = new Popover(
			{
				style: { background: 'none', border: 'none', padding: 0, margin: '-6px' },
				autoOpen: false,
			},
			new ColorPicker(
				{
					value: this.options.color,
					onChange: ({ value }) => {
						this.options.color = value;
					},
					swatches: ['white', 'black', 'red', 'green', 'blue', 'random'],
				},
				new Input({
					type: 'range',
					value: this.options.lineWidth,
					min: 1,
					max: 21,
					onChange: event => {
						event.preventDefault();
						event.stopPropagation();
						this.options.lineWidth = event.value;
						this._inkwell.elem.style.height = `${Number.parseInt(event.value) + 9}px`;
					},
				}),
			),
		);

		const colorSwatch = new Button({
			icon: 'paintbrush',
			style: this.options.subscriber('color', backgroundColor => ({
				backgroundColor,
				color: context.domElem.theme.colors.mostReadable(backgroundColor, [
					context.domElem.theme.colors.white,
					context.domElem.theme.colors.black,
				]),
			})),
			onPointerPress: event => colorPicker.show({ x: event.clientX, y: event.clientY, maxHeight: 378, maxWidth: 318 }),
		});

		this.content([this._score, this._time, this._playPause, this._whiteboard, this._inkwell, colorPicker, colorSwatch]);

		super.render();
	}

	setOption(key, value) {
		if (key === 'score') this._score.content(`Score: ${value}`);
		else if (key === 'time') this._time.content(`Time Remaining: ${(value / 1000).toFixed(1)}s`);
		else if (key === 'paused') this[value ? 'pause' : 'play']();
		else super.setOption(key, value);
	}

	play() {
		if ((this.options.time ?? 0) <= 0) {
			this.options.score = 0;
			this.options.time = 3e4;
			this.options.inkLevel = 80;

			this.newShape();
		}

		this.timer = setInterval(() => {
			this.options.time -= 100;
			if (this.options.time <= 0) this.options.paused = true;
		}, 100);

		this._playPause.content('Pause');
		this._whiteboard.options.readOnly = false;
	}

	pause() {
		clearInterval(this.timer);
		clearTimeout(this.shapeTimeout);

		this._playPause.content('Play');
		this._time.content(this.options.time === 3e4 ? '' : `Paused: ${(this.options.time / 1000).toFixed(1)}s`);
		this._whiteboard.options.readOnly = true;
	}

	newShape() {
		this.shape = randomShape();

		this._whiteboard.empty();

		this._whiteboard.options.background = context.domElem.theme.colors.mostReadable(this.shape.color, [
			context.domElem.theme.colors.white,
			context.domElem.theme.colors.black,
		]);

		this._whiteboard.options.readOnly = true;

		this.shapeTimeout = setTimeout(() => {
			this._whiteboard.empty();
			this._whiteboard.options.readOnly = false;
		}, 2000);

		this._whiteboard.drawLine(this.shape);
		this.startTime = performance.now();
	}
}

export default class Example extends DemoView {
	render() {
		super.render();

		new DemoWrapper({ style: { height: '100%' }, appendTo: this }, new ShapeMatchGame());
	}
}
