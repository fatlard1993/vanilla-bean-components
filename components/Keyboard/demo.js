import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '../DomElem';
import { Keyboard } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const output = new DomElem({
			appendTo: this.demoWrapper,
		});

		const component = new Keyboard({
			appendTo: this.demoWrapper,
			// onKeyDown: console.log,
			// onKeyUp: console.log,
			onKeyPress: event => {
				const { key } = event.detail;
				const shiftKey = event.target.elem.querySelector('button.shift')?._domElem;

				if (key === 'number' || key === 'simple') component.setLayout(key);
				else if (key === 'backspace') output.elem.textContent = output.elem.textContent.slice(0, -1);
				else if (key === 'clear') output.elem.textContent = output.elem.textContent = '';
				else if (key === 'return' || key === 'done') {
					console.log('ACCEPT', output.elem.textContent);
					output.elem.textContent = output.elem.textContent = '';
				} else if (key === 'shift') {
					const action = shiftKey.hasClass('pressed') ? 'removeClass' : 'addClass';
					shiftKey[action]('pressed');
				} else {
					const keyText = shiftKey?.hasClass('pressed') ? key.toUpperCase() : key;
					output.elem.textContent = `${output.elem.textContent || ''}${keyText}`;
				}
			},
		});

		super.render({ ...options, component });
	}
}
