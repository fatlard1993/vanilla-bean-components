import DemoView from '../../demo/DemoView';
import { TagList } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new TagList({ tags: ['one', '2', 'three'] });
	}
}
