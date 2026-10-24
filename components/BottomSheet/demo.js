import DemoView from '../../demo/DemoView';
import { Button, Component } from '../..';
import { BottomSheet } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new BottomSheet({
			append: [
				new Component({
					tag: 'p',
					textContent:
						'Bottom sheet content goes here. Drag the handle down, press Escape or the dimmed page to close it.',
					style: { padding: '0 16px' },
				}),
				new Button({
					textContent: 'Close',
					style: { margin: '0 16px 16px' },
					onPointerPress: () => this.component.close(),
				}),
			],
			onClose: () => console.log('sheet closed'),
		});

		new Button({
			textContent: 'Open Sheet',
			appendTo: this.demoWrapper,
			onPointerPress: () => this.component.open(),
		});
	}
}
