import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { TagList } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new TagList({ tags: ['one', '2', 'three'], appendTo: this.demoWrapper });

		super.render({ ...options, component });
	}
}
