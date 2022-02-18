import { TagList } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new TagList({ tags: ['one', '2', 'three'], appendTo: this.demoWrapper });
	}
}
