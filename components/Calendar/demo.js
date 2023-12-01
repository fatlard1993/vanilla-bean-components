import DemoView, { DemoWrapper } from '../../demo/DemoView';
import theme from '../../theme';
import { Calendar } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Calendar({
			appendTo: this.demoWrapper,
		});

		component.addEvent({
			at: Date.now(),
			label: 'test',
			color: theme.colors.purple,
			duration: 60 * 60 * 1000,
		});

		super.render({ ...options, component });
	}
}
