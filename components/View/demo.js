import DemoView from '../../demo/DemoView';
import { View } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new View({ textContent: 'A general purpose page layout wrapper' });

		super({ component, ...options });
	}
}
