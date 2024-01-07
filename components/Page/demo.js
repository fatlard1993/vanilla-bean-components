import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Page } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Page({
			textContent:
				'The entrypoint to a page built with vanilla-bean-components. Mounts its children when the dom is ready',
			style: { width: 'auto', height: 'auto' },
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
