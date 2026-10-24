import { describe, test, expect, mock } from 'bun:test';
import { findByText, getAllByRole, getByText, queryByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { Form } from '../Form';
import { TagList } from '.';

describe('TagList', () => {
	test('must render', async () => {
		const textContent = 'textContent';

		new TagList({ value: [textContent], appendTo: container });

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

		test('refuses what accept rejects, saying so until the entry is changed', async () => {
			const user = userEvent.setup();
			const tagList = new TagList({ accept, appendTo: container });

			await user.type(tagList.tagInput.elem, 'Monopoly{Enter}');

			expect(tagList.options.value).toEqual([]);
			expect(tagList.tagInput.elem).toHaveAttribute('aria-invalid', 'true');
			expect(tagList.tagInput.elem).toHaveAccessibleDescription('Can\'t add "Monopoly"');

			await user.type(tagList.tagInput.elem, 'x');

			expect(tagList.tagInput.elem).not.toHaveAttribute('aria-invalid');
		});
	});

	describe('value', () => {
		test('a tag added or removed changes the value and is announced with it', async () => {
			const user = userEvent.setup();
			const onChange = mock();
			const tagList = new TagList({ value: ['one'], onChange, appendTo: container });

			await user.type(tagList.tagInput.elem, 'two{Enter}');

			expect(tagList.options.value).toEqual(['one', 'two']);
			expect(onChange).toHaveBeenCalledTimes(1);
			expect(onChange.mock.calls[0][0].value).toEqual(['one', 'two']);

			await user.click(getAllByRole(container, 'button')[0]);

			expect(tagList.options.value).toEqual(['two']);
			expect(onChange.mock.calls[1][0].value).toEqual(['two']);
			expect(queryByText(container, 'one')).toBeNull();
		});

		test('a value set from outside is shown, and not announced as a change', () => {
			const onChange = mock();
			const tagList = new TagList({ value: ['a', 'b'], onChange, appendTo: container });

			tagList.options.value = ['b', 'c'];

			expect(queryByText(container, 'a')).toBeNull();
			expect(getByText(container, 'c')).toBeInTheDocument();
			expect(onChange).not.toHaveBeenCalled();
		});

		test('typing a tag is not a change of the list', async () => {
			const onChange = mock();
			const tagList = new TagList({ onChange, appendTo: container });

			await userEvent.setup().type(tagList.tagInput.elem, 'half');
			tagList.tagInput.elem.dispatchEvent(new Event('change', { bubbles: true }));

			expect(onChange).not.toHaveBeenCalled();
		});
	});

	describe('in a Form', () => {
		test('is a field: its tags are the data, and its validate shows below it', async () => {
			const form = new Form({
				data: { tags: ['co-op'] },
				inputs: [
					{
						key: 'tags',
						InputComponent: TagList,
						validate: tags => (tags.length ? null : 'Add a tag'),
					},
				],
				appendTo: container,
			});
			const tagList = form.inputElements.tags;

			expect(getByText(container, 'co-op')).toBeInTheDocument();

			await userEvent.setup().type(tagList.tagInput.elem, 'party{Enter}');
			expect(form.options.data.tags).toEqual(['co-op', 'party']);
			expect(form.hasErrors()).toBe(false);

			form.options.data.tags = [];

			expect(queryByText(container, 'party')).toBeNull();
			expect(form.hasErrors()).toBe(true);
			expect(tagList.tagInput.elem).toHaveAccessibleDescription('Add a tag');
		});
	});

	test('suggestions reach the new-tag field', () => {
		const tagList = new TagList({ suggestions: ['Yahtzee'], appendTo: container });

		expect(tagList.tagInput.elem.getAttribute('list')).toBeTruthy();
	});
});
