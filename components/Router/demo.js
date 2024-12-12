import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Component } from '../Component';
import { Router } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Router({ views: {} });

		new Component({
			textContent: 'A basic hash based view router',
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
