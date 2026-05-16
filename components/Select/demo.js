import DemoView from '../../demo/DemoView';
import { Select } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Select({
			options: ['one', '2', { label: 'Three', value: 3 }, 'FOUR'],
			value: 3,
			onChange: console.log,
		});
	}
}
