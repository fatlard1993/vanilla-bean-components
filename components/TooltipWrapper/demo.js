import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { TooltipWrapper } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new TooltipWrapper({
			textContent: 'My Custom TextContent',
			tooltip: 'My Custom Hover Tooltip',
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
