import DemoView from '../../demo/DemoView';
import { Page } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Page({
			textContent:
				'The entrypoint to a page built with vanilla-bean-components. Mounts its children when the dom is ready',
		});

		super({ component, ...options });
	}
}
