import { DomElem, Keyboard, styled } from '../..';

import DemoView, { DemoWrapper } from '../DemoView';

const CalculatorDisplay = styled(
	DomElem,
	({ colors }) => `
		font-size: 24px;
		background: ${colors.black};
		text-align: right;
		padding: 18px;
	`,
);

const StyledKeyboard = styled(
	Keyboard,
	({ colors }) => `
		& > div:first-of-type > button {
			background-color: ${colors.dark(colors.gray)};
		}

		& > div > button:last-of-type {
			background-color: ${colors.orange};
		}

		button {
			background-color: ${colors.gray};
			height: 84px !important;
			font-size: 22px;
		}
	`,
);

export class Calculator extends DomElem {
	constructor(options = {}) {
		super({
			result: 0,
			styles: () => `
				max-width: 396px;
				margin: 0 auto;
			`,
			...options,
		});
	}

	render() {
		this._display = new CalculatorDisplay();
		this._keypad = new StyledKeyboard({
			layout: 'calculator',
			keyDefinitions: {
				clear: { class: 'fa-trash-can', text: '' },
				backspace: { class: 'fa-left-long', text: '' },
				'*': { class: 'fa-xmark', text: '' },
				'%': { class: 'fa-percent', text: '' },
				'÷': { class: 'fa-divide', text: '' },
				'-': { class: 'fa-minus', text: '' },
				'+': { class: 'fa-plus', text: '' },
				'=': { class: 'fa-equals', text: '' },
				0: { class: 'u2' },
			},
			layouts: {
				calculator: [
					['clear', 'backspace', '%', '÷'],
					['7', '8', '9', '*'],
					['4', '5', '6', '-'],
					['1', '2', '3', '+'],
					['0', '.', '='],
				],
			},
			onKeyPress: event => {
				const { key } = event.detail;

				if (key === 'clear') this.options.result = '';
				else if (key === '=') this.options.result = eval(this.options.result);
				else if (key === 'backspace') this.options.result = this.options.result.slice(-1);
				else this.options.result = this.options.result === 0 ? key : `${this.options.result}${key}`;
			},
		});

		this.content([this._display, this._keypad]);

		super.render();
	}

	setOption(key, value) {
		if (key === 'result') this._display.content(`${value}`);
		else super.setOption(key, value);
	}
}

export default class Example extends DemoView {
	render() {
		super.render();

		new DemoWrapper({ appendTo: this }, new Calculator());
	}
}
