import { NumberInput } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new NumberInput({ appendTo: this.demoWrapper });
	}
}
