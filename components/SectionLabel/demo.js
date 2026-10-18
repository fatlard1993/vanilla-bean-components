import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { SectionLabel } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new SectionLabel({ textContent: 'Recent' });

		new Component({ textContent: 'A group of things sits under its label.', appendTo: this.demoWrapper });
	}
}
