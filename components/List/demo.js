import DemoView from '../../demo/DemoView';
import { List } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new List({
			items: [{ textContent: 'one' }, { textContent: 'two' }, { textContent: 'three' }],
		});

		super({ component, ...options });
	}
}
