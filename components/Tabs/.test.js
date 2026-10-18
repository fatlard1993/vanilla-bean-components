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
		expect(onChange.mock.calls[0][0]).toBe('people');
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
