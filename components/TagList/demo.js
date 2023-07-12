import DemoView from '../../demo/DemoView';
import { TagList } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new TagList({ tags: ['one', '2', 'three'] });

		super({ component, ...options });
	}
}
