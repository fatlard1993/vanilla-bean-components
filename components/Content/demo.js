import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { Content } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Content({
			padding: '0 12px',
			style: { maxHeight: '160px' },
			append: Array.from({ length: 30 }, (_, index) => new Component({ textContent: `Row ${index + 1}` })),
		});
	}
}
