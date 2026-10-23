import { throttle } from './data';

const RELEASES = ['pointerup', 'pointerleave', 'pointercancel'];

/**
 * Follows a gesture of one or more pointers, from the first pointerdown to the last pointer's release. The first pointer
 * starts it and is its `initiator`; later ones join it. Moves and releases are heard on the document, so a pointer that
 * strays off the element keeps the gesture going.
 * @example
 * const gesture = pointerGesture({ move: (event, pointer) => draw(event, pointer), up: event => finish(event) });
 * canvas.addEventListener('pointerdown', event => gesture.start(event));
 * @param {object} [options] - What the gesture does
 * @param {Function} [options.down] - (event, pointer) on each pointerdown; returns the pointer's state, else the one it had (or `{}`)
 * @param {Function} [options.move] - (event, pointer) on a tracked pointer's move
 * @param {Function} [options.up] - (event, pointer) on a tracked pointer's release, before it's forgotten
 * @param {number|Function} [options.throttle] - Least milliseconds between moves, or a function read as each gesture starts
 * @returns {object} `start(event)`, `clear()`, `pointers` (state by pointerId), `count`, and `active`
 */
export const pointerGesture = ({ down, move, up, throttle: wait = 0 } = {}) => {
	const pointers = {};
	let stopListening;

	const end = () => {
		stopListening?.();
		stopListening = undefined;
	};

	const gesture = {
		pointers,
		/** @returns {number} How many pointers are down */
		get count() {
			return Object.keys(pointers).length;
		},
		/** @returns {boolean} Whether a gesture is under way */
		get active() {
			return Boolean(stopListening);
		},
		/**
		 * Take a pointerdown: the gesture's first pointer starts it, any other joins it
		 * @param {PointerEvent} event - The pointerdown
		 */
		start(event) {
			const { pointerId } = event;

			pointers[pointerId] = down?.(event, pointers[pointerId]) ?? pointers[pointerId] ?? {};

			if (stopListening) return;

			pointers[pointerId].initiator = true;

			const onMove = throttle(
				moved => pointers[moved.pointerId] && move?.(moved, pointers[moved.pointerId]),
				typeof wait === 'function' ? wait() : wait,
			);
			const onRelease = released => {
				const pointer = pointers[released.pointerId];

				if (!pointer) return;

				released.preventDefault();
				up?.(released, pointer);

				delete pointers[released.pointerId];

				if (gesture.count === 0) end();
			};

			document.addEventListener('pointermove', onMove);
			for (const type of RELEASES) document.addEventListener(type, onRelease);

			stopListening = () => {
				document.removeEventListener('pointermove', onMove);
				for (const type of RELEASES) document.removeEventListener(type, onRelease);
			};
		},
		/** Forget every pointer and end the gesture, without calling `up` */
		clear() {
			for (const pointerId of Object.keys(pointers)) delete pointers[pointerId];

			end();
		},
	};

	return gesture;
};
