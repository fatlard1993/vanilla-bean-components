import { findByText, queryByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { TagList } from '.';

describe('TagList', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new TagList({ tags: [textContent], appendTo: container });

		await findByText(container, textContent);
	});

	describe('accept', () => {
		const games = ['Yahtzee', 'Chess'];
		const accept = value => games.find(game => game.toLowerCase() === value.toLowerCase()) ?? false;

		test('adds what accept returns, in its own spelling', async () => {
			const tagList = new TagList({ accept, appendTo: container });

			await userEvent.setup().type(tagList.tagInput.elem, 'chess{Enter}');

			expect(await findByText(container, 'Chess')).toBeInTheDocument();
		});

		test('refuses what accept rejects, and marks the field for a moment', async () => {
			const tagList = new TagList({ accept, appendTo: container });

			await userEvent.setup().type(tagList.tagInput.elem, 'Monopoly{Enter}');

			expect(queryByText(container, 'Monopoly')).toBeNull();
			expect(tagList.tagInput.elem).toHaveAttribute('aria-invalid', 'true');
		});
	});

	test('suggestions reach the new-tag field', () => {
		const tagList = new TagList({ suggestions: ['Yahtzee'], appendTo: container });

		expect(tagList.tagInput.elem.getAttribute('list')).toBeTruthy();
	});
});
