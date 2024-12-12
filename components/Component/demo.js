import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Component } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Component({
			tag: 'p',
			textContent: 'A general purpose component building block',
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
