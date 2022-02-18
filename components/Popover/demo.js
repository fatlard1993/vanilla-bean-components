import { Popover } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new Popover({ appendTo: this.demoWrapper });
	}
}
