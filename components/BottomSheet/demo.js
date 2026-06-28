import DemoView from '../../demo/DemoView';
import { Button, Component } from '../..';
import { BottomSheet } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new BottomSheet({
			append: new Component({
				tag: 'p',
				textContent: 'Bottom sheet content goes here.',
				style: { padding: '0 16px 16px' },
			}),
		});

		new Button({
			textContent: 'Open Sheet',
			appendTo: this.demoWrapper,
			onPointerPress: () => this.component.show(),
		});
	}
}
