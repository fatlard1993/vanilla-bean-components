import { Card } from '.';

describe('Card', () => {
	test('renders what it holds, in a card', () => {
		const card = new Card({ appendTo: container }, 'North 80');

		expect(container.firstElementChild).toBe(card.elem);
		expect(card.elem).toHaveTextContent('North 80');
	});
});
