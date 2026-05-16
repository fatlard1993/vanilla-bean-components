import { Component, Button } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './Counter.js.asText';

export class Counter extends Component {
	constructor(options = {}) {
		super({ tag: 'span', count: 0, ...options });
	}

	_setOption(key, value) {
		if (key === 'count') {
			const counter = new Component({ tag: 'span', content: `❤ ${value} ` });
			const plus = new Button({ content: '👍', onPointerPress: () => ++this.options.count });
			const minus = new Button({ content: '👎', onPointerPress: () => --this.options.count });

			this.content([counter, plus, minus]);
		} else super._setOption(key, value);
	}
}

export default class Example extends ExampleView {
	build() {
		this.options.exampleCode = exampleCode;

		new Counter({ appendTo: this.demoWrapper });
	}
}
