import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Label } from '../Label';
import { Link } from '../Link';
import { Icon } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Icon({
			icon: 'icons',
			appendTo: this.demoWrapper,
		});

		super.render({ ...options, component });

		new Label({
			appendTo: this,
			append: new Link({
				textContent: 'FontAwesome Icon Docs',
				href: 'https://fontawesome.com/search?m=free&s=solid%2Cregular%2Cbrands',
			}),
		});
	}
}
