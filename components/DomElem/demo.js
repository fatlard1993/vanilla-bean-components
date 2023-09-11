import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new DomElem({
			tag: 'p',
			textContent: 'A general purpose base element building block',
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
