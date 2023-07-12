import DemoView from '../../demo/DemoView';
import { Search } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Search();

		super({ component, ...options });
	}
}
