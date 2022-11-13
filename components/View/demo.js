import { DomElem, View, Label } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		new View({ appendTo: this.demoWrapper });

		new Label({
			label: 'A general purpose page layout wrapper',
			appendTo: this.demoContent,
		});

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' })],
		});
	}
}
