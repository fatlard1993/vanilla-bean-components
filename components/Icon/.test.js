import { Icon } from '.';

describe('Icon', () => {
	test('must render', async () => {
		new Icon({ icon: 'icons', appendTo: container });
	});
});
