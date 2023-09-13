import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '../DomElem';
import { Button } from '../Button';
import { Dialog } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const openDialog = () =>
			new Dialog({
				header: 'header',
				body: [new DomElem({ style: { color: 'green' }, textContent: 'body' }), 'more content'],
				buttons: ['noop', 'dismiss'],
				onButtonPress: ({ button, closeDialog }) => {
					console.log({ button, closeDialog });

					closeDialog();
				},
			});

		const component = openDialog();

		super.render({ ...options, component });

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open',
			onPointerPress: () => openDialog(),
		});
	}
}
