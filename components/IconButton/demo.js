import { IconButton, Label, TextInput, Link } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const icon = 'icons';

		const iconButton = new IconButton({ appendTo: this.demoWrapper, icon });

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
					(iconButton.className = iconButton.className.replace(/fa-\w+/, `fa-${value}`)),
			}),
		});
	}
}
