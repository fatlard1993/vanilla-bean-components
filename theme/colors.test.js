import colors from './colors';

describe('theme colors', () => {
	test('named hues are frozen shared instances', () => {
		expect(Object.isFrozen(colors.yellow)).toBe(true);
		expect(Object.isFrozen(colors.selected)).toBe(true);
	});

	test('mutating a shared hue throws instead of recoloring the app', () => {
		expect(() => colors.selected.setAlpha(0.5)).toThrow();
		expect(colors.yellow.a).toBe(1);
	});

	test('alpha() derives transparency without touching the source', () => {
		const translucent = colors.alpha(colors.blue, 0.4);

		expect(translucent.a).toBe(0.4);
		expect(colors.blue.a).toBe(1);
	});

	test('ramp helpers return fresh instances safe to modify', () => {
		const light = colors.light(colors.teal);

		expect(Object.isFrozen(light)).toBe(false);
		light.setAlpha(0.5);
		expect(colors.teal.a).toBe(1);
	});
});
