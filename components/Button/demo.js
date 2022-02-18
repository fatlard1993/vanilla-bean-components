import { Button, Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const textContent = 'demo';

		const button = new Button({ appendTo: this.demoWrapper, textContent });

		new Label({
			label: 'textContent',
			appendTo: this.elem,
			appendChild: new TextInput({ value: textContent, onChange: ({ value }) => (button.textContent = value) }),
		});
	}
}
