import { Component, Button } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './Counter.js.asText';

export class Counter extends Component {
	constructor(options = {}) {
		super({ tag: 'span', count: 0, ...options });
	}

	build() {
		// Structure created once — only the display updates on count change
		new Component({
			tag: 'span',
			appendTo: this,
			textContent: this.options.subscriber('count', n => `❤ ${n} `),
		});
		new Button({ content: '👍', appendTo: this, onPointerPress: () => ++this.options.count });
		new Button({ content: '👎', appendTo: this, onPointerPress: () => --this.options.count });
	}
}

export default class Example extends ExampleView {
	build() {
		this.options.exampleCode = exampleCode;

		new Counter({ appendTo: this.demoWrapper });
	}
}
