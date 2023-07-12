import DemoView from '../../demo/DemoView';
import { Link } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Link({ textContent: 'textContent', href: '#/Dialog' });

		super({ component, ...options });
	}
}
