import { getByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Elem } from '../../Elem';
import { Tabs } from '.';

describe('Tabs', () => {
	const tabs = [
		{ id: 'chat', label: 'Chat', count: 2 },
		{ id: 'comments', label: 'Comments' },
		{ id: 'people', label: 'People' },
	];
	const tab = name => getByRole(container, 'tab', { name: new RegExp(`^${name}`) });

	test('a tablist of tabs, the first selected unless another is', () => {
		new Tabs({ tabs, appendTo: container });

		expect(getByRole(container, 'tablist')).toBeInTheDocument();
		expect(tab('Chat')).toHaveAttribute('aria-selected', 'true');
		expect(tab('Comments')).toHaveAttribute('aria-selected', 'false');
		expect(tab('Chat')).toHaveTextContent('Chat2');
	});

	test('pressing a tab selects it and calls onChange once', async () => {
		const onChange = mock();
		const strip = new Tabs({ tabs, onChange, appendTo: container });

		await userEvent.setup().click(tab('People'));
		await userEvent.setup().click(tab('People'));

		expect(strip.options.selected).toBe('people');
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0].value).toBe('people');
		expect(onChange.mock.calls[0][0].type).toBe('change');
	});

	test('the arrow keys, Home and End move along and select, passing over a disabled tab', async () => {
		const strip = new Tabs({
			tabs: [tabs[0], { ...tabs[1], disabled: true }, tabs[2]],
			appendTo: container,
		});

		tab('Chat').focus();
		await userEvent.setup().keyboard('{ArrowRight}');
		expect(strip.options.selected).toBe('people');
		expect(tab('People')).toHaveFocus();

		await userEvent.setup().keyboard('{ArrowRight}');
		expect(strip.options.selected).toBe('chat');

		await userEvent.setup().keyboard('{End}');
		expect(strip.options.selected).toBe('people');
		expect(tab('Chat').tabIndex).toBe(-1);
	});

	test('panels show only while their tab is selected, and are tied to it for assistive tech', async () => {
		const chat = new Elem({ textContent: 'chat panel', appendTo: container });
		const people = new Elem({ textContent: 'people panel', appendTo: container });

		new Tabs({ tabs, panels: { chat, people }, appendTo: container });

		expect(chat.elem.hidden).toBe(false);
		expect(people.elem.hidden).toBe(true);
		expect(chat.elem).toHaveAttribute('role', 'tabpanel');
		// The class the theme's always-hidden rule hangs on
		expect(people.elem).toHaveClass('vbc-tabpanel');
		expect(tab('Chat')).toHaveAttribute('aria-controls', chat.elem.id);

		await userEvent.setup().click(tab('People'));

		expect(chat.elem.hidden).toBe(true);
		expect(people.elem.hidden).toBe(false);
	});

	test('a count can change on its own, and zero clears it', () => {
		const strip = new Tabs({ tabs, appendTo: container });

		strip.count('comments', 5);
		expect(tab('Comments')).toHaveTextContent('Comments5');

		strip.count('comments', 0);
		expect(tab('Comments')).toHaveTextContent(/^Comments$/);
	});
});

describe('Tabs ids and panels', () => {
	test('numeric ids select', () => {
		const panels = { 0: new Elem(), 1: new Elem() };
		const tabs = new Tabs({
			tabs: [
				{ id: 0, label: 'Zero' },
				{ id: 1, label: 'One' },
			],
			panels,
			selected: 1,
			appendTo: container,
		});

		expect(getByRole(container, 'tab', { name: 'One' }).getAttribute('aria-selected')).toBe('true');
		expect(panels[1].elem.hidden).toBe(false);
		expect(panels[0].elem.hidden).toBe(true);
		tabs.destroy();
	});

	test('a tab taken away takes its panel with it', () => {
		const panels = { a: new Elem(), b: new Elem() };
		const tabs = new Tabs({
			tabs: [
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B' },
			],
			panels,
			selected: 'a',
			appendTo: container,
		});

		tabs.options.tabs = [{ id: 'b', label: 'B' }];

		expect(panels.a.elem.hidden).toBe(true);
		expect(panels.b.elem.hidden).toBe(false);
		tabs.destroy();
	});
});

describe('Tabs selection rules', () => {
	const tabs = [
		{ id: 'a', label: 'A' },
		{ id: 'b', label: 'B', disabled: true },
		{ id: 'c', label: 'C' },
	];

	test('a selection that names no tab settles on the first, without counting as a change', () => {
		const onChange = mock();
		const strip = new Tabs({ tabs, selected: 'nope', onChange, appendTo: container });

		expect(strip.options.selected).toBe('a');
		expect(onChange).not.toHaveBeenCalled();
	});

	test('select() refuses a disabled tab, an unknown one, and the one already selected', () => {
		const onChange = mock();
		const strip = new Tabs({ tabs, onChange, appendTo: container });

		strip.select('b');
		strip.select('missing');
		strip.select('a');

		expect(strip.options.selected).toBe('a');
		expect(onChange).not.toHaveBeenCalled();

		strip.select('c');

		expect(strip.options.selected).toBe('c');
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	test('tabs given again keep the selection, and a count for a tab that is gone is nothing', () => {
		const strip = new Tabs({ tabs, selected: 'c', appendTo: container });

		strip.options.tabs = [...tabs, { id: 'd', label: 'D' }];

		expect(strip.options.selected).toBe('c');
		expect(getByRole(container, 'tab', { name: 'C' })).toHaveAttribute('aria-selected', 'true');
		expect(() => strip.count('missing', 3)).not.toThrow();
		expect(getByRole(container, 'tab', { name: 'D' })).toHaveAttribute('tabindex', '-1');
	});

	test('the segmented variant marks the row and keeps the tabs', () => {
		const strip = new Tabs({ tabs, variant: 'segmented', appendTo: container });

		expect(strip.elem).toHaveClass('variant-segmented');
		expect(getByRole(container, 'tablist')).toBe(strip.elem);
		expect(() => (strip.options.variant = 'pills')).toThrow('not a valid variant');
	});

	test('a panel is labelled by its tab, and the tab says which panel it controls', () => {
		const panel = new Elem({ appendTo: container });
		new Tabs({ tabs, panels: { a: panel }, appendTo: container });

		expect(panel.elem.getAttribute('aria-labelledby')).toBe(getByRole(container, 'tab', { name: 'A' }).id);
		expect(getByRole(container, 'tab', { name: 'A' }).getAttribute('aria-controls')).toBe(panel.elem.id);
	});
});
