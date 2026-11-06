import { Card } from '.';

describe('Card', () => {
	test('renders what it holds, in a card', () => {
		const card = new Card({ appendTo: container }, 'North 80');

		expect(container.firstElementChild).toBe(card.elem);
		expect(card.elem).toHaveTextContent('North 80');
	});
});

describe('Card accent and press', () => {
	test('an accent stripes the edge in its color, and none takes the stripe away', () => {
		const card = new Card({ accent: '#ff0000', appendTo: container });

		expect(card.elem).toHaveClass('accented');
		expect(card.elem.style.getPropertyValue('--card-accent')).toBe('#ff0000');

		card.options.accent = null;

		expect(card.elem).not.toHaveClass('accented');
		expect(card.elem.style.getPropertyValue('--card-accent')).toBe('');
	});

	test('given a press, a card is a button: reached by Tab, pressed by Enter', () => {
		const onPointerPress = mock();
		const card = new Card({ onPointerPress, appendTo: container }, 'North 80');

		expect(card.elem).toHaveClass('interactive');
		expect(card.elem.getAttribute('role')).toBe('button');
		expect(card.elem.tabIndex).toBe(0);

		card.elem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

		expect(onPointerPress).toHaveBeenCalledTimes(1);
	});

	test('interactive can be refused, or turned off again', () => {
		const card = new Card({ onPointerPress: () => {}, interactive: false, appendTo: container });

		expect(card.elem.hasAttribute('role')).toBe(false);

		card.options.interactive = true;

		expect(card.elem.getAttribute('role')).toBe('button');

		card.options.interactive = false;

		expect(card.elem.hasAttribute('role')).toBe(false);
		expect(card.elem.hasAttribute('tabindex')).toBe(false);
	});

	test('a card that is a <button> already is left to the browser', () => {
		const card = new Card({ tag: 'button', onPointerPress: () => {}, appendTo: container });

		expect(card.elem.hasAttribute('role')).toBe(false);
		expect(card.elem.hasAttribute('tabindex')).toBe(false);
	});
});
