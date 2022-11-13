import { DomElem, Textarea, Label } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const appendTo = this.demoContent;

		new Textarea({
			appendTo: this.demoWrapper,
			value: 'multiline\nvalue',
			onChange: console.log,
			onKeyUp: console.log,
		});

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
