import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { List } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new List({
			items: [
				{ textContent: 'one', style: { textTransform: 'uppercase' } },
				'two',
				{ textContent: 'three', styles: ({ colors }) => ({ color: colors.blue }) },
			],
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
