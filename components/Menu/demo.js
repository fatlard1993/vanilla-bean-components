import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Menu } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Menu({
			items: [
				{ textContent: 'one', style: { textTransform: 'uppercase' } },
				'two',
				{ textContent: 'three', styles: ({ colors }) => `color: ${colors.red};` },
			],
			onSelect: console.log,
			style: { width: '60px' },
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
