import { copyToClipboard, isMac, readClipboard } from './dom';

test('isMac', () => {
	global.navigator = { platform: 'Linux' };

	expect(isMac()).toStrictEqual(false);

	global.navigator = { platform: 'macOS' };

	expect(isMac()).toStrictEqual(true);
});

test('copyToClipboard', () => {
	const writeText = global.mock();

	global.isSecureContext = true;
	global.navigator = { clipboard: { writeText } };

	copyToClipboard('test');

	expect(writeText.mock.calls.length).toStrictEqual(1);
});

test('readClipboard', () => {
	const readText = global.mock();

	global.isSecureContext = true;
	global.navigator = { clipboard: { readText } };

	readClipboard();

	expect(readText.mock.calls.length).toStrictEqual(1);
});
