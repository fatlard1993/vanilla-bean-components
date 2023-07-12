import DemoView from '../../demo/DemoView';
import { TextInput } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new TextInput({ value: 'value', onChange: console.log, onKeyUp: console.log });

		super({ component, ...options });
	}
}
