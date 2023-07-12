import DemoView from '../../demo/DemoView';
import { NumberInput } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new NumberInput({
			value: 42,
			onChange: console.log,
			onKeyUp: console.log,
		});

		super({ component, ...options });
	}
}
