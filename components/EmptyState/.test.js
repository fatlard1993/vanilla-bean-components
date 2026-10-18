import { findByRole, findByText, queryByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { EmptyState } from '.';

describe('EmptyState', () => {
	test('shows its title and message', async () => {
		new EmptyState({ title: 'No fields yet', message: 'Draw one on the map.', appendTo: container });

		await findByText(container, 'No fields yet');
		await findByText(container, 'Draw one on the map.');
	});

	test('an action becomes a button that does it', async () => {
		const onPointerPress = mock();

		new EmptyState({ title: 'Nothing here', action: { textContent: 'Add one', onPointerPress }, appendTo: container });

		await userEvent.setup().click(await findByRole(container, 'button', { name: 'Add one' }));

		expect(onPointerPress).toHaveBeenCalledTimes(1);
	});

	test('the parts follow their options, and without an action there is no button', async () => {
		const empty = new EmptyState({ title: 'First', icon: 'seedling', appendTo: container });

		expect(queryByRole(container, 'button')).toBeNull();
		expect(empty._icon.elem.hidden).toBe(false);

		empty.options.title = 'Second';
		empty.options.icon = null;

		await findByText(container, 'Second');
		expect(empty._icon.elem.hidden).toBe(true);
	});
});
