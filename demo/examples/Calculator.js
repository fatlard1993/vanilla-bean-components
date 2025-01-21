import { Component, Keyboard, styled } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './Calculator.js.asText';

const CalculatorDisplay = styled(
	Component,
	() => `
	font-size: 24px;
	background: ${({ colors }) => colors.black};
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

export class Calculator extends Component {
	constructor(options = {}) {
		super({
			result: 0,
			...options,
			style: {
				maxWidth: '396px',
				margin: '0 auto',
				...options.style,
			},
		});
	}

	render() {
		this._display = new CalculatorDisplay();
		this._keypad = new StyledKeyboard({
			layout: 'calculator',
			keyDefinitions: {
				clear: { icon: 'trash-can', text: '' },
				backspace: { icon: 'left-long', text: '' },
				'*': { icon: 'xmark', text: '' },
				'%': { icon: 'percent', text: '' },
				'÷': { icon: 'divide', text: '' },
				'-': { icon: 'minus', text: '' },
				'+': { icon: 'plus', text: '' },
				'=': { icon: 'equals', text: '' },
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

export default class Example extends ExampleView {
	render() {
		this.options.exampleCode = exampleCode;

		super.render();

		new Calculator({ appendTo: this.demoWrapper });
	}
}
