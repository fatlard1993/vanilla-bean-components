import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { Keyboard } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new Keyboard({
			onKeyDown: console.log,
			onKeyUp: console.log,
			onKeyPress: event => {
				const { key } = event.detail;
				const shiftKey = event.target.elem.querySelector('button.shift')?._component;

				if (key === 'number' || key === 'simple') this.component.setLayout(key);
				else if (key === 'backspace') this.output.elem.textContent = this.output.elem.textContent.slice(0, -1);
				else if (key === 'clear') this.output.elem.textContent = this.output.elem.textContent = '';
				else if (key === 'return' || key === 'done') {
					console.log('ACCEPT', this.output.elem.textContent);
					this.output.elem.textContent = this.output.elem.textContent = '';
				} else if (key === 'shift') {
					const action = shiftKey.hasClass('pressed') ? 'removeClass' : 'addClass';
					shiftKey[action]('pressed');
				} else {
					const keyText = shiftKey?.hasClass('pressed') ? key.toUpperCase() : key;
					this.output.elem.textContent = `${this.output.elem.textContent || ''}${keyText}`;
				}
			},
		});

		super.render();

		this.output = new Component({
			appendTo: this.demoWrapper,
			styles: ({ colors }) => ({
				margin: '12px',
				background: colors.black,
				color: colors.green,
				padding: '6px',
			}),
		});
	}
}
