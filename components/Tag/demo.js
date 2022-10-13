import { Tag } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const tag = 'tag';
		const readOnly = false;

		new Tag({ appendTo: this.demoWrapper, tag, readOnly });
	}
}
