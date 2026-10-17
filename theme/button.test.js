import theme from '.';

describe('theme.button', () => {
	test('hover and press nudge with translate, never top, so a button placed by bottom stays put', () => {
		const css = theme.button;
		const rule = selector => css.slice(css.indexOf(selector), css.indexOf('&:after', css.indexOf(selector)));

		expect(rule('&:hover, &:focus {')).toContain('translate: 0 -1px');
		expect(rule('&:active,')).toContain('translate: 0 1px');
		expect(rule('&:hover, &:focus {')).not.toMatch(/^\s*top:/m);
		expect(rule('&:active,').split('&:before')[0]).not.toMatch(/^\s*top:/m);
	});
});
