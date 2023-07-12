import DemoView from '../../demo/DemoView';
import { Label } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Label({ label: 'label' });

		super({ component, ...options });
	}
}
