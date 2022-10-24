import { Input } from '..';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new Input({ appendTo: this.demoWrapper, value: 'value' });
	}
}
