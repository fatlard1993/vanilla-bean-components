import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Checkbox } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Checkbox({
			name: 'enabled',
			value: true,
			onChange: ({ value }) => {
				this.component.options.name = value ? 'enabled' : 'disabled';
			},
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
