import DemoView from '../../demo/DemoView';
import { Select } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Select({
			label: 'myCustomLabel',
			options: ['one', '2', { label: 'Three', value: 3 }],
			value: 3,
			onChange: console.log,
		});

		super({ component, ...options });
	}
}
