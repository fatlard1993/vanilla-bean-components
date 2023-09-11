import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { ColorPicker } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new ColorPicker({
			value: 'random',
			onChange: console.log,
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
