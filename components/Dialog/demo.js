import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '../DomElem';
import { Button } from '../Button';
import { Dialog } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Dialog({
			header: 'header',
			size: 'small',
			body: [
				new DomElem({
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

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open',
			onPointerPress: () => this.component.open(),
		});

		super.render();
	}
}
