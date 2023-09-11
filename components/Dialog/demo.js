import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Button } from '../Button';
import { Dialog } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Dialog({
			header: 'header',
			content: 'content',
			buttons: ['noop', 'dismiss'],
			onButtonPress: (...args) => {
				console.log(...args);
				component.close();
			},
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open',
			onPointerPress: () => component.open(),
		});

		component.open();
	}
}
