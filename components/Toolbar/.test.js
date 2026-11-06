import { getByRole, queryByRole } from '@testing-library/dom';

import { Button } from '../Button';
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

describe('Toolbar heading', () => {
	test('a heading is a level 1 heading at the start, titled in full, unless given another level', () => {
		const toolbar = new Toolbar({ heading: 'Fields', appendTo: container });

		// eslint-disable-next-line testing-library/no-node-access
		expect(getByRole(container, 'heading', { level: 1, name: 'Fields' })).toBe(toolbar.elem.firstElementChild);
		expect(toolbar.elem.firstElementChild.title).toBe('Fields');

		toolbar.options.level = 2;
		toolbar.options.heading = 'Crops';

		expect(getByRole(container, 'heading', { level: 2, name: 'Crops' })).toBeDefined();
	});

	test('the heading stays through empty(), while the controls go', async () => {
		const toolbar = new Toolbar({ heading: 'Fields', appendTo: container }, new Button({ textContent: 'Add' }));

		toolbar.empty();
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(getByRole(container, 'heading', { name: 'Fields' })).toBeDefined();
		expect(queryByRole(container, 'button')).toBeNull();
	});

	test('no heading takes the heading away, and the bar variant marks the row', () => {
		const toolbar = new Toolbar({ heading: 'Fields', variant: 'bar', appendTo: container });

		toolbar.options.heading = '';

		expect(queryByRole(container, 'heading')).toBeNull();
		expect(toolbar.elem).toHaveClass('variant-bar');
	});
});
