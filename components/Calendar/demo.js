import DemoView from '../../demo/DemoView';
import theme from '../../theme';
import { Calendar } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Calendar({
			view: 'month',
		});

		this.component.addEvent({
			at: Date.now(),
			label: 'test',
			color: theme.colors.purple,
			duration: 60 * 60 * 1000,
		});
	}
}
