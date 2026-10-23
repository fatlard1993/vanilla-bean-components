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

	test('alpha takes a CSS color as well as a theme color', () => {
		expect(colors.alpha('#ff0000', 0.5).toRgbString()).toBe('rgba(255, 0, 0, 0.5)');
		expect(colors.alpha(colors.red, 0.5).getAlpha()).toBe(0.5);
	});

	test('every role can be given a color of its own, and given back to its hues', () => {
		const roles = [
			'surface',
			'raised',
			'accent',
			'edge',
			'overlay',
			'warning',
			'success',
			'danger',
			'info',
			'muted',
			'border',
			'selected',
		];
		const own = colors.alpha('#123456', 1);

		for (const role of roles) {
			const derived = colors[role].toHslString();

			colors[role] = own;
			expect(colors[role]).toBe(own);

			colors[role] = undefined;
			expect(colors[role].toHslString()).toBe(derived);
		}
	});

	test('a role follows its hue until it is given its own', () => {
		expect(colors.danger).toBe(colors.red);
	});

	test("a role given its own color is drawn in it by the theme's styles", async () => {
		const { default: theme } = await import('.');
		const own = colors.alpha('#123456', 1);

		colors.selected = own;
		expect(theme.page).toContain(String(own));
		colors.selected = undefined;
		expect(theme.page).not.toContain(String(own));
	});
});
