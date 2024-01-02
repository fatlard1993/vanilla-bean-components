import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Menu } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Menu({
			items: [{ textContent: 'one' }, { textContent: 'two' }, { textContent: 'three' }],
			onSelect: console.log,
			style: { width: '60px' },
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
