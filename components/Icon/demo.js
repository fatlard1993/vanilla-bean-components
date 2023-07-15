import DemoView from '../../demo/DemoView';
import { Label } from '../Label';
import { Link } from '../Link';
import { Icon } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Icon({
			icon: 'icons',
		});

		super({ component, ...options });

		new Label({
			label: 'Docs Link',
			appendTo: this.demoContent,
			append: new Link({
				appendTo: this.demoContent,
				textContent: 'FontAwesome Icon Docs',
				href: 'https://fontawesome.com/search?m=free&s=solid%2Cregular%2Cbrands',
			}),
		});
	}
}
