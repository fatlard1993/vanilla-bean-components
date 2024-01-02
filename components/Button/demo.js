import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Button } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Button({
			icon: 'icons',
			tooltip: { textContent: 'tooltip', position: 'bottom' },
			onPointerPress: console.log,
			textContent: 'textContent',
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
