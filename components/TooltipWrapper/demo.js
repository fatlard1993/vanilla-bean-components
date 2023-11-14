import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { TooltipWrapper } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new TooltipWrapper({
			textContent: 'My Custom TextContent',
			tooltip: 'My Custom Hover Tooltip',
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
