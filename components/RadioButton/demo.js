import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { RadioButton } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new RadioButton({
			options: ['one', { label: 'two', value: 2 }, 'three'],
			value: 2,
			onChange: console.log,
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
