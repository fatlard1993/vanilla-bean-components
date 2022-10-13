import { ModalDialog, Button, Label, Select } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

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
					onDismiss: ({ closeDialog }) => closeDialog(),
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
	}
}
