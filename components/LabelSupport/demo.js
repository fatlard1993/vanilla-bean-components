import DemoView from '../../demo/DemoView';
import { LabelSupport } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new LabelSupport({ label: 'label', textContent: 'textContent' });

		super({ component, ...options });
	}
}