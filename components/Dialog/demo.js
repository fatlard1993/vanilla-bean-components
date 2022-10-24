import { Dialog, Label, TextInput, Select } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const header = 'header';
		const content = 'content';
		const sizes = ['small', 'standard', 'large'];

		const dialog = new Dialog({
			appendTo: this.demoWrapper,
			header,
			content,
			buttons: ['onDismiss: console.log'],
			onDismiss: console.log,
		});

		const appendTo = this.demoContent;

		new Label({
			label: 'header',
			appendTo,
			appendChild: new TextInput({
				value: header,
				onKeyUp: ({ target: { value } }) => (dialog.elem.children[0].textContent = value),
			}),
		});
		new Label({
			label: 'content',
			appendTo,
			appendChild: new TextInput({
				value: content,
				onKeyUp: ({ target: { value } }) => (dialog.elem.children[1].textContent = value),
			}),
		});
		new Label({
			label: 'size',
			appendTo,
			appendChild: new Select({
				value: sizes[0],
				options: sizes,
				onChange: ({ value }) => {
					dialog.elem.classList.remove(...sizes);
					dialog.elem.classList.add(value);
				},
			}),
		});
	}
}
