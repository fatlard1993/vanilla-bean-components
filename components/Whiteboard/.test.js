import { Whiteboard } from '.';

// happy dom doesn't support canvas yet
describe.skip('Whiteboard', () => {
	test('must render a whiteboard', async () => {
		new Whiteboard({ appendTo: container });
	});
});
