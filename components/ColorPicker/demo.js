import { ColorPicker, Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const label = 'label';

		const colorPicker = new ColorPicker({ label, onChange: console.log, appendTo: this.demoWrapper });

		const appendTo = this.demoContent;

		new Label({
			label: 'label',
			appendTo,
			appendChild: new TextInput({
				value: label,
				onKeyUp: ({ target: { value } }) => (colorPicker.label.elem.children[0].textContent = value),
			}),
		});
		new Label({
			label: 'onChange: console.log',
			appendTo,
		});
	}
}
