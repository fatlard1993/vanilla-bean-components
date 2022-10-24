import { Button, Label, TextInput } from '../';

import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const textContent = 'onPointerPress: console.log';

		const button = new Button({ appendTo: this.demoWrapper, onPointerPress: console.log, textContent });

		const appendTo = this.demoContent;

		new Label({
			label: 'textContent',
			appendTo,
			appendChild: new TextInput({
				value: textContent,
				onKeyUp: ({ target: { value } }) => (button.elem.textContent = value),
			}),
		});
	}
}
