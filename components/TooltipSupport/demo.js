import DemoView from '../../demo/DemoView';
import { TooltipSupport } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new TooltipSupport({
			textContent: 'My Custom TextContent',
			tooltip: 'My Custom Hover Tooltip',
		});

		super({ component, ...options });
	}
}
