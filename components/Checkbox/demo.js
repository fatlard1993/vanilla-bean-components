import DemoView from '../../demo/DemoView';
import { Checkbox } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Checkbox({
			label: 'enabled',
			value: true,
			onChange: ({ target: { checked } }) => {
				component.name = checked ? 'enabled' : 'disabled';
			},
		});

		super({ component, ...options });
	}
}
