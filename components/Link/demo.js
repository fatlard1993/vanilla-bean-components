import { Link, Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const appendTo = this.elem;
		const textContent = 'textContent';
		const href = '#/link?test=success';

		const linkElem = new Link({ appendTo: this.demoWrapper, textContent, href });

		new Label({
			label: 'textContent',
			appendTo,
			appendChild: new TextInput({
				value: textContent,
				onChange: ({ value }) => {
					linkElem.textContent = value;
				},
			}),
		});

		new Label({
			label: 'href',
			appendTo,
			appendChild: new TextInput({
				value: href,
				onChange: ({ value }) => {
					linkElem.href = value;
				},
			}),
		});
	}
}
