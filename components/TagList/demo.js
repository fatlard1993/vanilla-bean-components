import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { TagList } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new TagList({ tags: ['one', '2', 'three'], appendTo: this.demoWrapper });

		super.render();
	}
}
