import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Textarea } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Textarea({
			value: 'multiline\nvalue',
			onChange: console.log,
			onKeyUp: console.log,
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
