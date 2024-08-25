import { styled } from '../../utils';
import { DomElem } from '../DomElem';
import Key from './Key';

const KeyRow = styled(
	DomElem,
	() => `
		display: flex;
	`,
);

class Keyboard extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				layout: 'simple',
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

	setOption(key, value) {
		if (key === 'layouts' || key === 'keyDefinitions') return;
		else if (key === 'layout') this.setLayout(value);
		else super.setOption(key, value);
	}

	// todo native keyboard events https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent

	setLayout(name) {
		const rows = this.options.layouts[name];

		if (typeof name !== 'string' || !rows) return;

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
					keyDefinition,
					appendTo: row,
					onPointerDown: event => this.emit('keyDown', { event, key: keyDefinition?.key || key, target: event.target?._domElem }),
					onPointerUp: event => this.emit('keyUp', { event, key: keyDefinition?.key || key, target: event.target?._domElem }),
					onPointerPress: event => this.emit('keyPress', { event, key: keyDefinition?.key || key, target: event.target?._domElem }),
				});
			});
		});
	}

	onKeyDown(callback) {
		this.addEventListener('keyDown', callback);

		return () => this.removeEventListener('keyDown', callback);
	}

	onKeyUp(callback) {
		this.addEventListener('keyUp', callback);

		return () => this.removeEventListener('keyUp', callback);
	}

	onKeyPress(callback) {
		this.addEventListener('keyPress', callback);

		return () => this.removeEventListener('keyPress', callback);
	}
}

export default Keyboard;
