import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new DomElem({
			tag: 'p',
			textContent: 'A general purpose base element building block',
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
