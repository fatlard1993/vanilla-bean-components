import { DomElem, Button, Label, TextInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const textContent = 'textContent';
		const icon = 'refresh';

		const button = new Button({ icon, appendTo: this.demoWrapper, onPointerPress: console.log, textContent });

		const appendTo = this.demoContent;

		new Label({
			label: 'textContent',
			appendTo,
			appendChild: new TextInput({
				value: textContent,
				onKeyUp: ({ target: { value } }) => (button.elem.textContent = value),
			}),
		});

		new Label({
			label: 'icon',
			appendTo,
			appendChild: new TextInput({
				value: icon,
				onKeyUp: ({ target: { value } }) =>
					(button.elem.className = button.elem.className.replace(
						/IconButton fa-\w+/,
						value ? `IconButton fa-${value}` : undefined,
					)),
			}),
		});

		new Label({
			label: 'onPointerPress: console.log',
			appendTo,
		});

		new Label({
			label: 'Props',
			appendTo,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- icon [string] (optional)' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' }),
			],
		});
	}
}
