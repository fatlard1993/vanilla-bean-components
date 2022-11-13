import { DomElem, IconButton, Label, TextInput, NumberInput, Link } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const icon = 'icons';

		const iconButton = new IconButton({
			appendTo: this.demoWrapper,
			icon,
			style: { fontSize: '16px', width: '32px', height: '32px' },
		});

		const appendTo = this.demoContent;

		new Label({
			label: 'Docs Link',
			appendTo,
			appendChild: new Link({
				appendTo,
				textContent: 'FontAwesome Icon Docs',
				href: 'https://fontawesome.com/search?m=free&s=solid%2Cregular%2Cbrands',
			}),
		});

		new Label({
			label: 'icon',
			appendTo,
			appendChild: new TextInput({
				value: icon,
				onKeyUp: ({ target: { value } }) =>
					(iconButton.elem.className = iconButton.elem.className.replace(/fa-\w+/, `fa-${value}`)),
			}),
		});

		new Label({
			label: 'fontSize',
			appendTo,
			appendChild: new NumberInput({
				value: 16,
				onKeyUp: ({ target: { value } }) => {
					iconButton.elem.style.fontSize = `${value}px`;
					iconButton.elem.style.height = iconButton.elem.style.width = `${value * 2}px`;
				},
			}),
		});

		new Label({
			label: 'Props',
			appendTo,
			appendChildren: [
				new DomElem({ tag: 'pre', textContent: '- icon [string] (required)' }),
				new DomElem({ tag: 'pre', textContent: '- ...rest => Button' }),
			],
		});
	}
}
