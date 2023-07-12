import DemoView from '../../demo/DemoView';
import { IconButton } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new IconButton({ icon: 'icons' });

		super({ component, ...options });
	}
}
