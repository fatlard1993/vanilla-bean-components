import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '../DomElem';
import { Button } from '../Button';
import { Dialog } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const openDialog = moreOptions =>
			new Dialog({
				header: 'header',
				size: 'small',
				body: [new DomElem({ style: { color: 'green' }, textContent: 'body' }), 'more content'],
				buttons: ['noop', 'dismiss'],
				onButtonPress: ({ button, closeDialog }) => {
					console.log({ button, closeDialog });

					closeDialog();
				},
				...moreOptions,
			});

		this.component = openDialog();

		super.render();

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open',
			onPointerPress: () => openDialog(this.component.options),
		});
	}
}
