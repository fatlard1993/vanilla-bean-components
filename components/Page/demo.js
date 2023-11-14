import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Page } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Page({
			textContent:
				'The entrypoint to a page built with vanilla-bean-components. Mounts its children when the dom is ready',
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
