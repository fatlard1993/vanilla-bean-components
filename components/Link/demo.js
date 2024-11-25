import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Link } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Link({
			textContent: 'textContent',
			href: '#/Dialog',
			variant: 'button',
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
