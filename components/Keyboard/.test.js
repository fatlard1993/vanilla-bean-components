import { fireEvent, getByRole } from '@testing-library/dom';

import { Keyboard } from '.';

const pressKey = (keyboard, name) => {
	const key = getByRole(keyboard.elem, 'button', { name });

	fireEvent.pointerDown(key);
	fireEvent.pointerUp(key);
	fireEvent.click(key);
};

describe('Keyboard', () => {
	test('must render a Keyboard', async () => {
		new Keyboard({ appendTo: container });
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
