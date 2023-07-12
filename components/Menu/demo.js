import DemoView from '../../demo/DemoView';
import { Menu } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Menu({
			items: [{ textContent: 'one' }, { textContent: 'two' }, { textContent: 'three' }],
			onSelect: console.log,
			style: { width: '60px' },
		});

		super({ component, ...options });
	}
}
