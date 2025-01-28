import DemoView from '../../demo/DemoView';
import { RadioButton } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new RadioButton({
			options: ['one', { label: 'two', value: 2 }, 'three'],
			value: 2,
			onChange: console.log,
		});

		super.render();
	}
}
