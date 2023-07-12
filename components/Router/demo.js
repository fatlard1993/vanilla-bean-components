import DemoView from '../../demo/DemoView';
import { Label } from '../Label';
import { Router } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Router();

		super({ component, ...options });

		new Label({
			label: 'A basic hash based view router',
			appendTo: this.demoContent,
		});
	}
}
