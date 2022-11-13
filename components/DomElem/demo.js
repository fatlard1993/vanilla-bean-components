import { DomElem } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		new DomElem({
			tag: 'p',
			appendTo: this.demoWrapper,
			textContent: 'A general purpose base element building block',
		});
	}
}
