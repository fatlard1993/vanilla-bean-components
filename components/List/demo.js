import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { List } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new List({
			items: [{ textContent: 'one' }, { textContent: 'two' }, { textContent: 'three' }],
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
