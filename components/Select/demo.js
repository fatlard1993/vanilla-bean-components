import { DomElem, Select, Label } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		new Select({
			label: 'myCustomLabel',
			options: ['one', '2', { label: 'Three', value: 3 }],
			value: 3,
			onChange: console.log,
			appendTo: this.demoWrapper,
		});

		new Label({
			label: 'onChange: console.log',
			appendTo: this.demoContent,
		});

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- options [Array(string)] (optional) :: []' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => Input' }),
			],
		});
	}
}
