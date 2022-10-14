import { View, Label } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new View({ appendTo: this.demoWrapper });

		new Label({
			label: 'A general purpose page layout wrapper',
			appendTo: this.demoContent,
		});
	}
}
