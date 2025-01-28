import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { Button } from '../Button';
import { Dialog } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new Dialog({
			header: 'header',
			size: 'small',
			variant: null,
			body: [
				new Component({
					style: { color: 'green' },
					textContent: 'body',
				}),
				'more content',
			],
			buttons: ['noop', 'dismiss'],
			openOnRender: false,
			onButtonPress: ({ button, closeDialog }) => {
				console.log({ button, closeDialog });

				closeDialog();
			},
		});

		super.render();

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open',
			onPointerPress: () => this.component.open(),
		});
	}
}
