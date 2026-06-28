import { tactileResponse } from '../../utils';
import { styled } from '../../styled';
import { Component } from '../../Component';
import Key from './Key';

const KeyRow = styled(
	Component,
	() => `
		display: flex;
	`,
);

/**
 * Virtual keyboard component with customizable layouts and tactile feedback.
 *
 * Provides touch-friendly keyboard interface with predefined layouts (simple, number)
 * and configurable key definitions. Supports layout switching and key event handling.
 * @param {object} [options={}] - Keyboard configuration options
 * @param {string} [options.layout='simple'] - Initial keyboard layout name
 * @param {boolean} [options.tactileResponse=true] - Whether to provide haptic feedback on key press
 * @param {object} [options.keyDefinitions] - Key configuration object mapping key names to definitions
 * @param {object} [options.layouts] - Layout configuration object mapping layout names to key arrays
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Keyboard} Keyboard component instance
 */
class Keyboard extends Component {
	constructor(options = {}, ...children) {
		super(
			{
				layout: 'simple',
				tactileResponse: true,
				keyDefinitions: {
					simple: { text: 'ABC' },
					number: { text: '123' },
					shift: { class: 'u1_5' },
					return: { class: 'u1_5' },
					backspace: { class: 'u1_5' },
					clear: { class: 'u1_5' },
					done: { class: 'u1_5' },
					exponent: { key: 'e', text: 'e', class: 'u1_5' },
					space: { key: ' ', text: ' ', class: 'u6' },
				},
				layouts: {
					simple: [
						['simple', 'number'],
						['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
						['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
						['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
						[',', '.', 'space', '!', 'return'],
					],
					number: [
						['simple', 'number'],
						['1', '2', '3', 'backspace'],
						['4', '5', '6', 'clear'],
						['7', '8', '9', 'done'],
						['.', '0', '-', 'exponent'],
					],
				},
				...options,
			},
			...children,
		);

		this.setLayout(this.options.layout);
	}

	static handlers = {
		// Claim these keys so standard routing doesn't try to assign them as elem properties.
		// Both are read directly from this.options in setLayout() and key resolution.
		layouts() {},
		keyDefinitions() {},
		layout(value) {
			this.setLayout(value);
		},
	};

	// todo native keyboard events https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent

	/**
	 * Switches the keyboard to the specified layout and rebuilds the keys.
	 * @param {string} name - Layout name to switch to
	 */
	setLayout(name) {
		const rows = this.options.layouts[name];

		if (typeof name !== 'string' || !rows) return;

		this.children.forEach(child => child.destroy?.());
		this.empty();
		this.removeClass(/\blayout-\S+\b/g).addClass(`layout-${name}`);

		rows.forEach(columns => {
			const row = new KeyRow({ appendTo: this });

			columns.forEach(key => {
				let keyDefinition = this.options.keyDefinitions[key];

				if (!keyDefinition) {
					Object.entries(this.options.keyDefinitions).forEach(([keyName, definition]) => {
						if (!keyName.startsWith('^') || !keyName.endsWith('$')) return;

						if (new RegExp(keyName, 'i').test(key)) keyDefinition = definition;
					});
				}

				new Key({
					key,
					...keyDefinition,
					appendTo: row,
					onPointerDown: event => {
						if (this.options.tactileResponse) tactileResponse();

						this.emit('keyDown', {
							event,
							key: keyDefinition?.key || key,
							keyDefinition,
							target: event.target?._component,
						});
					},
					onPointerUp: event =>
						this.emit('keyUp', {
							event,
							key: keyDefinition?.key || key,
							keyDefinition,
							target: event.target?._component,
						}),
					onPointerPress: event =>
						this.emit('keyPress', {
							event,
							key: keyDefinition?.key || key,
							keyDefinition,
							target: event.target?._component,
						}),
				});
			});
		});
	}

	/**
	 * Registers a callback for key down events.
	 * @param {Function} callback - Event handler function
	 * @returns {Function} Unsubscribe function
	 */
	onKeyDown(callback) {
		this.addEventListener('keyDown', callback);

		return () => this.removeEventListener('keyDown', callback);
	}

	/**
	 * Registers a callback for key up events.
	 * @param {Function} callback - Event handler function
	 * @returns {Function} Unsubscribe function
	 */
	onKeyUp(callback) {
		this.addEventListener('keyUp', callback);

		return () => this.removeEventListener('keyUp', callback);
	}

	/**
	 * Registers a callback for key press events.
	 * @param {Function} callback - Event handler function
	 * @returns {Function} Unsubscribe function
	 */
	onKeyPress(callback) {
		this.addEventListener('keyPress', callback);

		return () => this.removeEventListener('keyPress', callback);
	}
}

export default Keyboard;
