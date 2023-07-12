import DemoView from '../../demo/DemoView';
import { NoData } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new NoData({ textContent: 'There is no data to display' });

		super({ component, ...options });
	}
}
