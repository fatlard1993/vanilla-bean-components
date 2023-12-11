import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Checkbox } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Checkbox({
			name: 'enabled',
			value: true,
			onChange: ({ value }) => {
				component.options.name = value ? 'enabled' : 'disabled';
			},
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
