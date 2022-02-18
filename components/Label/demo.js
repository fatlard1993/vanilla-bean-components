import { Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const label = 'label';

		const labelElem = new Label({ appendTo: this.demoWrapper, label });

		new Label({
			label: 'label',
			appendTo: this.elem,
			appendChild: new TextInput({
				value: label,
				onChange: ({ value }) => {
					labelElem.textContent = value;
				},
			}),
		});
	}
}
