import DemoView from '../../demo/DemoView';
import { Button } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Button({
			icon: 'icons',
			tooltip: { textContent: 'tooltip', position: 'bottom' },
			onPointerPress: console.log,
			textContent: 'textContent',
		});

		super({ component, ...options });
	}
}
