import DemoView from '../../demo/DemoView';
import { Button } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new Button({
			icon: 'icons',
			tooltip: { textContent: 'tooltip', position: 'bottom' },
			onPointerPress: console.log,
			textContent: 'textContent',
		});

		super.render();
	}
}
