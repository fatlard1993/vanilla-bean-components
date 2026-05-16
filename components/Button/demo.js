import DemoView from '../../demo/DemoView';
import { Button } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Button({
			icon: 'icons',
			tooltip: { textContent: 'tooltip', position: 'bottom' },
			onPointerPress: console.log,
			textContent: 'textContent',
		});
	}
}
