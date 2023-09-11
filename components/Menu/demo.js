import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Menu } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Menu({
			items: [{ textContent: 'one' }, { textContent: 'two' }, { textContent: 'three' }],
			onSelect: console.log,
			style: { width: '60px' },
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
