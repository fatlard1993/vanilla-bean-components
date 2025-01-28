import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { Router } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new Router({ views: {} });

		super.render();

		new Component({
			textContent: 'A basic hash based view router',
			appendTo: this.demoWrapper,
		});
	}
}
