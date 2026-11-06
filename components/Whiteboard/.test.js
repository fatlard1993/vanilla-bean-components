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
