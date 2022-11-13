import { Label, Modal, DomElem } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		new DomElem({ tag: 'p', textContent: 'Some background content', appendTo: this.demoWrapper });

		new Modal({ appendTo: this.demoWrapper });

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' })],
		});
	}
}
