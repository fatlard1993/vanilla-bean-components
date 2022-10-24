import { Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const label = 'label';

		const labelElem = new Label({ appendTo: this.demoWrapper, label }).elem;

		const appendTo = this.demoContent;

		new Label({
			label: 'label',
			appendTo,
			appendChild: new TextInput({
				value: label,
				onKeyUp: ({ target: { value } }) => (labelElem.children[0].textContent = value),
			}),
		});
	}
}
