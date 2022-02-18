import { Dialog, Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const appendTo = this.elem;
		const header = 'header';
		const content = 'content';

		const dialog = new Dialog({ appendTo: this.demoWrapper, header, content, buttons: ['todo'] });

		new Label({
			label: 'header',
			appendTo,
			appendChild: new TextInput({ value: header, onChange: ({ value }) => (dialog.children[0].textContent = value) }),
		});
		new Label({
			label: 'content',
			appendTo,
			appendChild: new TextInput({ value: content, onChange: ({ value }) => (dialog.children[1].textContent = value) }),
		});
	}
}
