import { DomElem, Link, Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

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

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' })],
		});
	}
}
