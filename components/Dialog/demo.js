import { DomElem, Dialog, Label, TextInput, Select } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const header = 'header';
		const content = 'content';
		const sizes = ['small', 'standard', 'large'];

		const dialog = new Dialog({
			appendTo: this.demoWrapper,
			header,
			content,
			buttons: ['noop', 'dismiss'],
			onButtonPress: console.log,
			style: { margin: '0 auto' },
		});

		const appendTo = this.demoContent;

		new Label({
			label: 'header',
			appendTo,
			appendChild: new TextInput({
				value: header,
				onKeyUp: ({ target: { value } }) => (dialog.elem.children[0].textContent = value),
			}),
		});

		new Label({
			label: 'content',
			appendTo,
			appendChild: new TextInput({
				value: content,
				onKeyUp: ({ target: { value } }) => (dialog.elem.children[1].textContent = value),
			}),
		});

		new Label({
			label: 'size',
			appendTo,
			appendChild: new Select({
				value: sizes[0],
				options: sizes,
				onChange: ({ value }) => {
					dialog.elem.classList.remove(...sizes);
					dialog.elem.classList.add(value);
				},
			}),
		});

		new Label({
			label: 'onButtonPress: console.log',
			appendTo,
		});

		new Label({
			label: 'Props',
			appendTo,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- size ["small"|"standard"|"large"] (optional) :: "small"' }),
				new DomElem({ tag: 'pre', textContent: '- header [string|DomElem|Array(DomElem)] (optional)' }),
				new DomElem({ tag: 'pre', textContent: '- content [string|DomElem|Array(DomElem)] (optional)' }),
				new DomElem({ tag: 'pre', textContent: '- footer((!buttons)) [DomElem|Array(DomElem)] (optional)' }),
				new DomElem({ tag: 'pre', textContent: '- buttons((!footer)) [Array(string)] (optional)' }),
				new DomElem({ tag: 'pre', textContent: '- onButtonPress((buttons)) [function] (optional) :: () => {}' }),
				new DomElem({ tag: 'pre', textContent: '- closeDialog [function] (optional)' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' }),
			],
		});
	}
}
