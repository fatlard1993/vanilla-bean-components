import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { List } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new List({
			items: [{ textContent: 'one' }, { textContent: 'two' }, { textContent: 'three' }],
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
