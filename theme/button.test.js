import button, { raised } from './button';
import theme from '.';

describe('button styles', () => {
	test('a raised button nudges with translate, never top, so a button placed by bottom stays put', () => {
		const css = raised(theme);
		const rule = selector => css.slice(css.indexOf(selector), css.indexOf('&:after', css.indexOf(selector)));

		expect(rule('&:hover, &:focus {')).toContain('translate: 0 -1px');
		expect(rule('&:active,')).toContain('translate: 0 1px');
		expect(rule('&:hover, &:focus {')).not.toMatch(/^\s*top:/m);
		expect(rule('&:active,').split('&:before')[0]).not.toMatch(/^\s*top:/m);
	});

	test('the default button moves nothing as it is pressed, and answers by brightness so a color of its own still works', () => {
		const css = button(theme);

		expect(css).not.toContain('translate');
		expect(css).toContain('filter: brightness(1.15)');
	});
});
