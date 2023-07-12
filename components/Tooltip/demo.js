import DemoView from '../../demo/DemoView';
import { Tooltip } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Tooltip({
			textContent: 'My Custom Tooltip',
			position: 'bottom',
			styles: () => `
				display: inline-block;
				position: relative;
			`,
		});

		super({ component, ...options });
	}
}
