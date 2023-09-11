import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Tooltip } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Tooltip({
			textContent: 'My Custom Tooltip',
			icon: 'icons',
			position: 'center',
			styles: () => `
				display: inline-block;
				position: relative;
			`,
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
