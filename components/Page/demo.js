import { Label, DomElem } from '..';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		new Label({
			label: 'The entrypoint to a page built with vanilla-bean-components. Mounts its children when the dom is ready',
			appendTo: this.demoContent,
		});

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' })],
		});
	}
}
