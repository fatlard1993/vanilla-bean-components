import {
	isMac,
	isNodeList,
	appendStyles,
	// empty,
	// remove,
	// getElemIndex,
	// isDescendantOf,
	// getPixelDensity,
	// getScreenOrientation,
} from './dom';

test('isMac', () => {
	global.navigator = { platform: 'Linux' };

	expect(isMac()).toStrictEqual(false);

	global.navigator = { platform: 'macOS' };

	expect(isMac()).toStrictEqual(true);
});

test('isNodeList', () => {
	expect(isNodeList([{}])).toStrictEqual(false);
});

test('appendStyles', () => {
	const styles = `
		.test {
			margin: 0;
		}
	`;
	let result;

	global.document = {
		createElement: () => ({}),
		head: {
			appendChild: style => {
				result = style;
			},
		},
	};

	appendStyles(styles);

	expect(result.innerHTML).toContain(styles);
});

test.skip('empty', () => {});

test.skip('remove', () => {});

test.skip('getElemIndex', () => {});

test.skip('isDescendantOf', () => {});

test.skip('getPixelDensity', () => {});

test.skip('getScreenOrientation', () => {});
