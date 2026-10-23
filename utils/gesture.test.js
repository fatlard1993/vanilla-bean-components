import { pointerGesture } from './gesture';

const pointer = (type, pointerId, init = {}) =>
	new PointerEvent(type, { bubbles: true, cancelable: true, pointerId, ...init });

describe('pointerGesture', () => {
	let gesture;

	afterEach(() => gesture?.clear());

	test('the first pointer starts the gesture and is its initiator; a second joins it', () => {
		gesture = pointerGesture();

		gesture.start(pointer('pointerdown', 1));
		gesture.start(pointer('pointerdown', 2));

		expect(gesture.active).toBe(true);
		expect(gesture.count).toBe(2);
		expect(gesture.pointers[1].initiator).toBe(true);
		expect(gesture.pointers[2].initiator).toBeUndefined();
	});

	test("moves and releases are heard on the document, with each pointer's state", () => {
		const move = mock();
		const up = mock();
		gesture = pointerGesture({ down: event => ({ startX: event.clientX }), move, up });

		gesture.start(pointer('pointerdown', 1, { clientX: 5 }));
		document.dispatchEvent(pointer('pointermove', 1, { clientX: 9 }));
		document.dispatchEvent(pointer('pointermove', 7));

		expect(move).toHaveBeenCalledTimes(1);
		expect(move.mock.calls[0][1]).toMatchObject({ startX: 5, initiator: true });

		document.dispatchEvent(pointer('pointerup', 1));

		expect(up).toHaveBeenCalledTimes(1);
		expect(up.mock.calls[0][1].startX).toBe(5);
		expect(gesture.count).toBe(0);
	});

	test('the gesture ends with its last pointer, and stops listening', () => {
		const move = mock();
		gesture = pointerGesture({ move });

		gesture.start(pointer('pointerdown', 1));
		gesture.start(pointer('pointerdown', 2));
		document.dispatchEvent(pointer('pointercancel', 1));
		expect(gesture.active).toBe(true);

		document.dispatchEvent(pointer('pointerleave', 2));
		expect(gesture.active).toBe(false);

		document.dispatchEvent(pointer('pointermove', 2));
		expect(move).not.toHaveBeenCalled();
	});

	test('a release of a pointer it is not tracking is left alone', () => {
		const up = mock();
		gesture = pointerGesture({ up });

		gesture.start(pointer('pointerdown', 1));
		const stray = pointer('pointerup', 9);
		document.dispatchEvent(stray);

		expect(up).not.toHaveBeenCalled();
		expect(stray.defaultPrevented).toBe(false);
		expect(gesture.active).toBe(true);
	});

	test('moves are throttled, by a number or by a function read as the gesture starts', () => {
		const move = mock();
		let wait = 10_000;
		gesture = pointerGesture({ move, throttle: () => wait });

		gesture.start(pointer('pointerdown', 1));
		document.dispatchEvent(pointer('pointermove', 1));
		document.dispatchEvent(pointer('pointermove', 1));
		expect(move).toHaveBeenCalledTimes(1);

		document.dispatchEvent(pointer('pointerup', 1));
		wait = 0;
		gesture.start(pointer('pointerdown', 1));
		document.dispatchEvent(pointer('pointermove', 1));
		document.dispatchEvent(pointer('pointermove', 1));
		expect(move).toHaveBeenCalledTimes(3);
	});

	test('clear forgets every pointer and ends the gesture without an up, and a new one can start', () => {
		const up = mock();
		gesture = pointerGesture({ up });

		gesture.start(pointer('pointerdown', 1));
		gesture.clear();

		expect(gesture.count).toBe(0);
		expect(gesture.active).toBe(false);
		document.dispatchEvent(pointer('pointerup', 1));
		expect(up).not.toHaveBeenCalled();

		gesture.start(pointer('pointerdown', 2));
		expect(gesture.pointers[2].initiator).toBe(true);
	});
});
