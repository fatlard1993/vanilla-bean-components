import { copyToClipboard, isMac, readClipboard } from './browser';

test('isMac => true', () => {
	const windowSpy = spyOn(window, 'window', 'get');

	windowSpy.mockImplementation(() => ({ navigator: { platform: 'macOS' } }));

	expect(isMac()).toStrictEqual(true);
});

test('isMac => false', () => {
	const windowSpy = spyOn(window, 'window', 'get');

	windowSpy.mockImplementation(() => ({ navigator: { platform: 'Linux' } }));

	expect(isMac()).toStrictEqual(false);
});

test('copyToClipboard', () => {
	const writeText = spyOn(window.navigator.clipboard, 'writeText');

	global.isSecureContext = true;

	copyToClipboard('test');

	expect(writeText).toHaveBeenCalledTimes(1);
});

test('readClipboard', () => {
	const readText = spyOn(window.navigator.clipboard, 'readText');

	global.isSecureContext = true;

	readClipboard();

	expect(readText).toHaveBeenCalledTimes(1);
});
