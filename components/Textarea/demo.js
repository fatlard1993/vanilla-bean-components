import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Textarea } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Textarea({
			value: 'multiline\nvalue',
			onChange: ({ value: newValue }) => {
				component.options.value = newValue;
				console.log('onChange', { newValue });
			},
			onKeyUp: console.log,
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
