import DemoView from '../../demo/DemoView';
import { List } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new List({
			items: [
				{ textContent: 'one', style: { textTransform: 'uppercase' } },
				'two',
				{ textContent: 'three', styles: ({ colors }) => ({ color: colors.blue }) },
			],
		});

		super.render();
	}
}
