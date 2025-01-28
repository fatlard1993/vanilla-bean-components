import DemoView from '../../demo/DemoView';
import { TagList } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new TagList({ tags: ['one', '2', 'three'] });

		super.render();
	}
}
