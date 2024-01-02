import DemoView, { DemoWrapper } from '../../demo/DemoView';
import theme from '../../theme';
import { Calendar } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Calendar({
			appendTo: this.demoWrapper,
		});

		this.component.addEvent({
			at: Date.now(),
			label: 'test',
			color: theme.colors.purple,
			duration: 60 * 60 * 1000,
		});

		super.render();
	}
}
