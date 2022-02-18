import { IconButton, Label, TextInput, Link } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const appendTo = this.elem;
		const icon = 'icons';

		const iconButton = new IconButton({ appendTo: this.demoWrapper, icon });

		new Link({
			appendTo,
			className: 'docLink',
			textContent: 'FontAwesome Icon Docs',
			href: 'https://fontawesome.com/search?m=free&s=solid%2Cregular%2Cbrands',
		});

		new Label({
			label: 'icon',
			appendTo,
			appendChild: new TextInput({
				value: icon,
				onChange: ({ value }) => {
					iconButton.className = iconButton.className.replace(/fa-\w+/, `fa-${value}`);
				},
			}),
		});
	}
}
