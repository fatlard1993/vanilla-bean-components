import { TinyColor, random as randomColor } from '@ctrl/tinycolor';
import Sketchy from 'moresketchy';

import {
	Elem,
	Component,
	Button,
	Whiteboard,
	Popover,
	ColorPicker,
	Input,
	randInt,
	randFromArray,
	rgbDelta,
	theme,
} from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './ShapeMatchGame.js.asText';

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

class ShapeMatchGame extends Component {
	constructor(options) {
		super({
			...options,
			inkLevel: 100,
			color: '#000',
			lineWidth: 3,
			style: {
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
			},
		});
	}

	build() {
		this._score = new Component();
		this._time = new Component();
		this._playPause = new Button(
			{ onPointerPress: () => (this.options.paused = !(this.options.paused ?? true)) },
			'Play',
		);

		const canvasWrapper = new Elem({
			style: { display: 'flex', flexDirection: 'row', margin: '12px auto', width: 'fit-content' },
		});

		const sidebar = new Elem({
			style: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '4px' },
			appendTo: canvasWrapper,
		});

		this._whiteboard = new Whiteboard({
			width: `${CANVAS_SIZE}px`,
			height: `${CANVAS_SIZE}px`,
			color: this.options.subscriber('color'),
			background: theme.colors.white,
			lineWidth: this.options.subscriber('lineWidth'),
			readOnly: this.options.subscriber('inkLevel', inkLevel => inkLevel <= 0),
			appendTo: canvasWrapper,
			onDraw: ({ detail: { from, to } }) => {
				const length = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
				const inkUse = (length || this.options.lineWidth) * this.options.lineWidth * 0.0005;

				this.options.inkLevel -= inkUse;
			},
			onLine: ({ detail: { line } }) => {
				if (!this.shape) return;

				const shapeSize = findSize(line);
				const responseTime = performance.now() - this.startTime;
				const lineWidthDelta = Math.abs(this.shape.width - this.options.lineWidth);
				const colorDelta = rgbDelta(
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

		this._inkwell = new Component({
			tag: 'progress',
			style: this.options.subscriber('color', accentColor => ({ accentColor })),
			max: 100,
			value: this.options.subscriber('inkLevel'),
			appendTo: sidebar,
		});

		this._inkwell.elem.style.writingMode = 'vertical-lr';
		this._inkwell.elem.style.transform = 'rotate(180deg)';
		this._inkwell.elem.style.flex = '1';
		this._inkwell.elem.style.width = '12px';
		this._inkwell.elem.style.margin = '0';

		const colorPicker = new Popover(
			{
				style: { background: 'none', border: 'none', padding: 0, margin: '-6px' },
				autoOpen: false,
				appendTo: document.body,
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
					},
				}),
			),
		);

		this.addCleanup('colorPicker', () => colorPicker.elem.remove());

		new Button({
			icon: 'paintbrush',
			style: this.options.subscriber('color', backgroundColor => ({
				backgroundColor,
				color: theme.colors.mostReadable(backgroundColor, [theme.colors.white, theme.colors.black]),
			})),
			onPointerPress: event => colorPicker.show({ x: event.clientX, y: event.clientY, maxHeight: 378, maxWidth: 318 }),
			appendTo: sidebar,
		});

		this.content([this._score, this._time, this._playPause, canvasWrapper]);
	}

	_setOption(key, value) {
		if (key === 'score') this._score.options.content = `Score: ${value}`;
		else if (key === 'time') this._time.options.content = `Time Remaining: ${(value / 1000).toFixed(1)}s`;
		else if (key === 'paused') this[value ? 'pause' : 'play']();
		else super._setOption(key, value);
	}

	play() {
		if ((this.options.time ?? 0) <= 0) {
			this.options.score = 0;
			this.options.time = 3e4;

			this.newShape();
		}

		this.timer = setInterval(() => {
			this.options.time -= 100;
			if (this.options.time <= 0) this.options.paused = true;
		}, 100);

		this._playPause.options.content = 'Pause';
	}

	pause() {
		clearInterval(this.timer);
		clearTimeout(this.shapeTimeout);

		this._playPause.options.content = 'Play';
		this._time.options.content = this.options.time === 3e4 ? '' : `Paused: ${(this.options.time / 1000).toFixed(1)}s`;
		this._whiteboard.options.readOnly = true;
	}

	newShape() {
		this.options.inkLevel = 100;
		this.shape = randomShape();

		this._whiteboard.clearCanvas();

		this._whiteboard.options.background = theme.colors.mostReadable(this.shape.color, [
			theme.colors.white,
			theme.colors.black,
		]);

		this._whiteboard.options.readOnly = true;

		this.shapeTimeout = setTimeout(() => {
			this._whiteboard.clearCanvas();
			this._whiteboard.options.readOnly = false;
		}, 2000);

		this._whiteboard.drawLine(this.shape);
		this.startTime = performance.now();
	}
}

export default class Example extends ExampleView {
	build() {
		this.options.exampleCode = exampleCode;

		new ShapeMatchGame({ style: { height: '70vh' }, appendTo: this.demoWrapper });
	}
}
