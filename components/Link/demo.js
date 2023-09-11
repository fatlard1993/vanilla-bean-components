import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Link } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Link({ textContent: 'textContent', href: '#/Dialog', appendTo: this.demoWrapper });

		super.render({ ...options, component });
	}
}
