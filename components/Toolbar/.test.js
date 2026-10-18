import { Toolbar } from '.';

describe('Toolbar', () => {
	test('wraps with a 12px gap by default, and follows its options', () => {
		const toolbar = new Toolbar({ appendTo: container });

		expect(toolbar.elem.style.gap).toBe('12px');
		expect(toolbar.elem.style.flexWrap).toBe('wrap');

		toolbar.options.gap = '0.5em';
		toolbar.options.wrap = false;

		expect(toolbar.elem.style.gap).toBe('0.5em');
		expect(toolbar.elem.style.flexWrap).toBe('nowrap');
	});
});
