import { Whiteboard } from '.';

describe('Whiteboard', () => {
	test('must render a whiteboard', async () => {
		new Whiteboard({ appendTo: container });
	});
});
