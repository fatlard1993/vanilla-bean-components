import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { NoData } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new NoData({ textContent: 'There is no data to display', appendTo: this.demoWrapper });

		super.render({ ...options, component });
	}
}
