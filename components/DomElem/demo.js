import DemoView from '../../demo/DemoView';
import { DomElem } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new DomElem({
			tag: 'p',
			textContent: 'A general purpose base element building block',
		});

		super({ component, ...options });
	}
}
