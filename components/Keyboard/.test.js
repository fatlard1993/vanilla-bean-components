import { Keyboard } from '.';

describe('Keyboard', () => {
	test('must render a Keyboard', async () => {
		new Keyboard({ appendTo: container });
	});
});
