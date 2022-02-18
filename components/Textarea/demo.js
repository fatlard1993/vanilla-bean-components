import { Textarea } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new Textarea({ appendTo: this.demoWrapper });
	}
}
