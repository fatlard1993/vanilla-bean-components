import { Label } from '..';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new Label({
			label: 'A basic hash based view router',
			appendTo: this.demoContent,
		});
	}
}
