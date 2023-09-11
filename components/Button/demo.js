import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Button } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Button({
			icon: 'icons',
			tooltip: { textContent: 'tooltip', position: 'bottom' },
			onPointerPress: console.log,
			textContent: 'textContent',
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });
	}
}
