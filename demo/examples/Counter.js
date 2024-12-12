import { Component, Button } from '../..';

import DemoView, { DemoWrapper } from '../DemoView';

export class Counter extends Component {
	constructor(options = {}) {
		super({ tag: 'span', count: 0, ...options });
	}

	setOption(key, value) {
		if (key === 'count') {
			const counter = new Component({ tag: 'span', content: `❤ ${value} ` });
			const plus = new Button({ content: '👍', onPointerPress: () => ++this.options.count });
			const minus = new Button({ content: '👎', onPointerPress: () => --this.options.count });

			this.content([counter, plus, minus]);
		} else super.setOption(key, value);
	}
}

export default class Example extends DemoView {
	render() {
		super.render();

		new DemoWrapper({ appendTo: this }, new Counter());
	}
}
