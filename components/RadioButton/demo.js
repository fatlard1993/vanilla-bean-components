import { DomElem, RadioButton, Label } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		new RadioButton({
			appendTo: this.demoWrapper,
			options: ['one', { label: 'two', value: 2 }, 'three'],
			value: 2,
			onChange: console.log,
		});

		const appendTo = this.demoContent;

		new Label({
			label: 'Props',
			appendTo,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- options' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' }),
			],
		});
	}
}
