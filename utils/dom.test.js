import { isMac, appendStyles } from './dom';

test('isMac', () => {
	global.navigator = { platform: 'Linux' };

	expect(isMac()).toStrictEqual(false);

	global.navigator = { platform: 'macOS' };

	expect(isMac()).toStrictEqual(true);
});

test('appendStyles', () => {
	const styles = `
		.test {
			margin: 0;
		}
	`;

	appendStyles(styles);

	expect(document.getElementsByTagName('style')[0].innerHTML).toContain(styles);
});

test.skip('copyToClipboard', () => {});
