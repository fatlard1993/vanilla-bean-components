import { DomElem, Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

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

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- label [string] (required)' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' }),
			],
		});
	}
}
