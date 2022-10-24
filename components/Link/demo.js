import { Link, Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const textContent = 'textContent';
		const href = '#/Dialog';

		const link = new Link({ appendTo: this.demoWrapper, textContent, href });

		const appendTo = this.demoContent;

		new Label({
			label: 'textContent',
			appendTo,
			appendChild: new TextInput({
				value: textContent,
				onKeyUp: ({ target: { value } }) => (link.elem.textContent = value),
			}),
		});

		new Label({
			label: 'href',
			appendTo,
			appendChild: new TextInput({
				value: href,
				onKeyUp: ({ target: { value } }) => (link.elem.href = value),
			}),
		});
	}
}
