import DemoView from '../../demo/DemoView';
import { Button } from '../Button';
import { Dialog } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Dialog({
			header: 'header',
			content: 'content',
			open: true,
			buttons: ['noop', 'dismiss'],
			onButtonPress: () => component.close(),
		});

		super({ component, ...options });

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open',
			onPointerPress: () => component.open(),
		});
	}
}
