import { DomElem, TextInput, Label } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const appendTo = this.demoContent;

		new TextInput({ appendTo: this.demoWrapper, value: 'value', onChange: console.log, onKeyUp: console.log });

		new Label({
			label: 'onChange: console.log',
			appendTo,
		});

		new Label({
			label: 'onKeyUp: console.log',
			appendTo,
		});

		new Label({
			label: 'Props',
			appendTo,
			appendChildren: [new DomElem({ tag: 'pre', textContent: '- ...rest => Input' })],
		});
	}
}
