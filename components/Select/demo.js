import { Select, Label } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new Select({ options: ['one', '2', 'three'], onChange: console.log, appendTo: this.demoWrapper });

		new Label({
			label: 'onChange: console.log',
			appendTo: this.demoContent,
		});
	}
}
