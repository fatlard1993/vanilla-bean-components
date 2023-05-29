import { DomElem, Label, TextInput, Button } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const textContent = 'Tooltip text';

		const button = new Button({
			textContent: 'Hover Me',
			appendTo: this.demoWrapper,
			tooltip: textContent,
		});

		const appendTo = this.demoContent;

		new Label({
			label: 'textContent',
			appendTo,
			appendChild: new TextInput({
				value: textContent,
				onKeyUp: ({ target: { value } }) => (button.tooltip.elem.textContent = value),
			}),
		});

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' })],
		});
	}
}
