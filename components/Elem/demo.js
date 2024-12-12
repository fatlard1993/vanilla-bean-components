import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Elem } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Elem({
			tag: 'p',
			textContent: 'A bare-bones general purpose element building block',
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
