import { fireEvent, getAllByRole, getByRole } from '@testing-library/dom';

import { Keyboard } from '.';

const pressKey = (keyboard, name) => {
	const key = getByRole(keyboard.elem, 'button', { name });

	fireEvent.pointerDown(key);
	fireEvent.pointerUp(key);
	fireEvent.click(key);
};

describe('Keyboard', () => {
	test('renders the default layout as a row of key buttons', () => {
		const keyboard = new Keyboard({ appendTo: container });

		expect(getAllByRole(keyboard.elem, 'button').length).toBeGreaterThan(20);
		expect(getByRole(keyboard.elem, 'button', { name: 'q' })).toBeDefined();
	});

	test('the onKeyDown, onKeyUp and onKeyPress options hear their key events', () => {
		const onKeyDown = mock();
		const onKeyUp = mock();
		const onKeyPress = mock();
		const keyboard = new Keyboard({ onKeyDown, onKeyUp, onKeyPress, tactileResponse: false, appendTo: container });

		pressKey(keyboard, 'q');

		for (const handler of [onKeyDown, onKeyUp, onKeyPress]) {
			expect(handler).toHaveBeenCalledTimes(1);
			expect(handler.mock.calls[0][0].detail.key).toBe('q');
		}
	});

	test('a key event carries what the definition sends', () => {
		const onKeyPress = mock();
		const keyboard = new Keyboard({ layout: 'number', onKeyPress, tactileResponse: false, appendTo: container });

		pressKey(keyboard, 'e');

		expect(onKeyPress.mock.calls[0][0].detail).toMatchObject({ key: 'e', keyDefinition: { key: 'e' } });
	});

	test('a native keydown inside the keyboard is not a key event', () => {
		const onKeyDown = mock();
		const keyboard = new Keyboard({ onKeyDown, appendTo: container });

		fireEvent.keyDown(getByRole(keyboard.elem, 'button', { name: 'q' }), { key: 'q' });

		expect(onKeyDown).not.toHaveBeenCalled();
	});

	test('key events are ordinary events: on() hears them, and a listener added with a signal ends with it', () => {
		const heard = mock();
		const later = mock();
		const keyboard = new Keyboard({ tactileResponse: false, appendTo: container });
		const stop = new AbortController();

		keyboard.on({ targetEvent: 'keyDown', callback: heard });
		keyboard.elem.addEventListener('keyDown', later, { signal: stop.signal });

		pressKey(keyboard, 'q');
		stop.abort();
		pressKey(keyboard, 'q');

		expect(heard).toHaveBeenCalledTimes(2);
		expect(later).toHaveBeenCalledTimes(1);
		expect(keyboard.onKeyDown).toBeUndefined();
	});
});

describe('Keyboard layouts and keys', () => {
	const keys = keyboard => getAllByRole(keyboard.elem, 'button').map(key => key.textContent);

	test('the number layout has digits and no letters, and the layout can change', () => {
		const keyboard = new Keyboard({ layout: 'number', appendTo: container });

		expect(keys(keyboard)).toEqual(expect.arrayContaining(['1', '2', '3', '0', '.', '-']));
		expect(keys(keyboard)).not.toContain('q');

		keyboard.options.layout = 'simple';

		expect(keys(keyboard)).toContain('q');
		expect(keyboard.elem).toHaveClass('layout-simple');
		expect(keyboard.elem).not.toHaveClass('layout-number');
	});

	test('a layout that does not exist is not switched to', () => {
		const keyboard = new Keyboard({ appendTo: container });

		keyboard.setLayout('nope');

		expect(keyboard.elem).toHaveClass('layout-simple');
		expect(keys(keyboard)).toContain('q');
	});

	test('a key definition gives a key its text, its width class and the key it sends', () => {
		const onKeyPress = mock();
		const keyboard = new Keyboard({ onKeyPress, tactileResponse: false, appendTo: container });
		// eslint-disable-next-line testing-library/no-node-access
		const space = keyboard.elem.querySelector('.space');

		expect(space).toHaveClass('u6');
		expect(getByRole(keyboard.elem, 'button', { name: 'ABC' })).toBeDefined();

		pressKey(keyboard, 'ABC');

		expect(onKeyPress.mock.calls[0][0].detail.key).toBe('simple');
	});

	test("layouts and key definitions of the app's own are drawn", () => {
		const keyboard = new Keyboard({
			layout: 'answer',
			layouts: { answer: [['y', 'n']] },
			keyDefinitions: { y: { text: 'Yes' }, n: { text: 'No', class: 'u2' } },
			appendTo: container,
		});

		expect(keys(keyboard)).toEqual(['Yes', 'No']);
		expect(getByRole(keyboard.elem, 'button', { name: 'No' })).toHaveClass('u2');
	});

	test("key definitions of the app's own are merged over the defaults, an entry of its own replacing that key's", () => {
		const keyboard = new Keyboard({
			keyDefinitions: { q: { text: 'Q!' }, number: { text: '#' } },
			appendTo: container,
		});

		expect(getByRole(keyboard.elem, 'button', { name: 'ABC' })).toBeDefined();
		expect(getByRole(keyboard.elem, 'button', { name: '#' })).toBeDefined();
		expect(getByRole(keyboard.elem, 'button', { name: 'Q!' })).toBeDefined();
		// eslint-disable-next-line testing-library/no-node-access
		expect(keyboard.elem.querySelector('.space')).toHaveClass('u6');
	});

	test('the layout option follows setLayout, and setting it still switches the layout', () => {
		const keyboard = new Keyboard({ appendTo: container });

		keyboard.setLayout('number');

		expect(keyboard.options.layout).toBe('number');
		expect(keys(keyboard)).toContain('1');

		keyboard.options.layout = 'simple';

		expect(keyboard.options.layout).toBe('simple');
		expect(keys(keyboard)).toContain('q');
		expect(keys(keyboard).filter(key => key === 'q')).toHaveLength(1);

		keyboard.setLayout('nope');

		expect(keyboard.options.layout).toBe('simple');
	});

	test('a pressed key vibrates the device unless told not to', () => {
		navigator.vibrate = mock();

		try {
			pressKey(new Keyboard({ appendTo: container }), 'q');

			expect(navigator.vibrate).toHaveBeenCalledTimes(1);

			pressKey(new Keyboard({ tactileResponse: false, appendTo: container }), 'q');

			expect(navigator.vibrate).toHaveBeenCalledTimes(1);
		} finally {
			delete navigator.vibrate;
		}
	});
});
