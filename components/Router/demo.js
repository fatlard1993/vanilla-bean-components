import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { Router } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Router({ views: {} });

		new Component({
			textContent: 'A basic hash based view router',
			appendTo: this.demoWrapper,
		});
	}
}
