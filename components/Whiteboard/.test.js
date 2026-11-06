import { Whiteboard } from '.';

describe('Whiteboard', () => {
	test('must render a whiteboard', async () => {
		new Whiteboard({ appendTo: container });
	});
});

describe('Whiteboard lines', () => {
	test('no lines is fine, and a position is a number', () => {
		const board = new Whiteboard({ lines: null, appendTo: container });

		expect(board.getPosition({ offsetX: 1.23456, offsetY: 2 })).toEqual({ x: 1.235, y: 2 });
	});
});

describe('Whiteboard strokes', () => {
	const down = (board, pointerId) =>
		board.elem.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId, clientX: 10, clientY: 10 }));
	const move = pointerId =>
		document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId, clientX: 20, clientY: 20 }));
	const up = pointerId =>
		document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId, clientX: 20, clientY: 20 }));

	test('a stroke draws as it goes and is emitted whole when the pointer lifts', () => {
		const onDraw = mock();
		const onLine = mock();
		const board = new Whiteboard({
			drawThrottle: 0,
			color: '#123456',
			lineWidth: 5,
			onDraw,
			onLine,
			appendTo: container,
		});
		const stroke = spyOn(board.canvas, 'stroke');

		down(board, 1);
		move(1);
		move(1);
		up(1);

		expect(onDraw).toHaveBeenCalledTimes(2);
		expect(onLine).toHaveBeenCalledTimes(1);
		expect(onLine.mock.calls[0][0].detail.line).toHaveLength(3);
		expect(onLine.mock.calls[0][0].detail).toMatchObject({ color: '#123456', width: 5 });
		expect(stroke).toHaveBeenCalled();
		expect(board.canvas.strokeStyle).toBe('#123456');
	});

	test('a tap is a dot: one point drawn and emitted', () => {
		const onDraw = mock();
		const board = new Whiteboard({ onDraw, appendTo: container });

		down(board, 1);
		up(1);

		expect(onDraw).toHaveBeenCalledTimes(1);
		expect(onDraw.mock.calls[0][0].detail.cap).toBe(true);
	});

	test('read-only, a pointer draws nothing', () => {
		const onDraw = mock();
		const onLine = mock();
		const board = new Whiteboard({ readOnly: true, drawThrottle: 0, onDraw, onLine, appendTo: container });

		down(board, 1);
		move(1);
		up(1);

		expect(onDraw).not.toHaveBeenCalled();
		expect(onLine).not.toHaveBeenCalled();
	});

	test('clearCanvas erases the picture and forgets the stroke in progress', () => {
		const board = new Whiteboard({ appendTo: container });
		const clearRect = spyOn(board.canvas, 'clearRect');

		down(board, 1);

		expect(Object.keys(board.pointers)).toHaveLength(1);

		board.clearCanvas();

		expect(clearRect).toHaveBeenCalledTimes(1);
		expect(Object.keys(board.pointers)).toHaveLength(0);
	});

	test('width and height size the canvas, and lines given are drawn', () => {
		const board = new Whiteboard({ width: '300px', height: '150px', appendTo: container });
		const stroke = spyOn(board.canvas, 'stroke');

		expect(board.elem.width).toBe(300);
		expect(board.elem.height).toBe(150);
		expect(board.elem.style.width).toBe('300px');

		board.options.lines = [
			{
				color: '#000',
				width: 2,
				line: [
					{ x: 0, y: 0 },
					{ x: 5, y: 5 },
				],
			},
		];

		expect(stroke).toHaveBeenCalledTimes(1);

		board.options.width = '200px';

		expect(board.elem.width).toBe(200);
		expect(stroke).toHaveBeenCalledTimes(2);
	});
});
