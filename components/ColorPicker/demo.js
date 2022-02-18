import { ColorPicker } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const appendTo = this.demoWrapper;

		new ColorPicker({ label: 'ColorPicker', appendTo });
	}
}
