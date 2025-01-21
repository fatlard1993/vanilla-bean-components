/// <reference lib="dom" />

import { appendStyles } from './appendStyles';

test('appendStyles', () => {
	const styles = `
		.test {
			margin: 0;
		}
	`;

	appendStyles(styles);

	expect(document.getElementsByTagName('style')[0].innerHTML).toContain(styles);
});
