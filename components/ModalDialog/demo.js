import { DomElem, ModalDialog, Button, Label, Select } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const header = 'header';
		const content = 'content';
		const sizes = ['small', 'standard', 'large'];

		let size = sizes[0];

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open ModalDialog',
			onPointerPress: () => {
				new ModalDialog({
					appendTo: this.demoContent,
					header,
					content,
					size,
					buttons: ['dismiss'],
					onButtonPress: ({ closeDialog }) => closeDialog(),
				});
			},
		});

		new Label({
			label: 'size',
			appendTo: this.demoContent,
			appendChild: new Select({
				value: size,
				options: sizes,
				onChange: ({ value }) => {
					size = value;
				},
			}),
		});

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- appendTo => Modal' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => Dialog' }),
			],
		});
	}
}
