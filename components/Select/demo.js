import { Select } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new Select({ options: ['one', '2', 'three'], appendTo: this.demoWrapper });
	}
}
