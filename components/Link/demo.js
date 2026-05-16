import DemoView from '../../demo/DemoView';
import { Link } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Link({
			textContent: 'textContent',
			href: '#/Dialog',
			variant: 'button',
		});
	}
}
