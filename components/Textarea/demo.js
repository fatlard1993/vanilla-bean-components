import DemoView from '../../demo/DemoView';
import { Textarea } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Textarea({
			value: 'multiline\nvalue',
			onChange: console.log,
			onKeyUp: console.log,
		});

		super({ component, ...options });
	}
}
