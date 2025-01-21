import { Elem, Component, Button } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './Stopwatch.js.asText';

export class Stopwatch extends Component {
	constructor(options = {}) {
		super({ tag: 'span', time: 0, interval: 10, running: false, ...options });
	}

	render() {
		this._time = new Elem({ tag: 'span' });

		const start = new Button({ content: 'Start', onPointerPress: () => this.start() });
		const stop = new Button({ content: 'Stop', onPointerPress: () => this.stop() });
		const reset = new Button({ content: 'Reset', onPointerPress: () => (this.options.time = 0) });

		this.content([this._time, start, stop, reset]);

		super.render();
	}

	setOption(key, value) {
		if (key === 'time') this._time.content(`${value}ms `);
		else if (key === 'running') this[value ? 'start' : 'stop']();
		else if (key === 'interval' && this.options.running) {
			this.stop();
			this.start(value);
		} else super.setOption(key, value);
	}

	start(interval = this.options.interval) {
		this.interval = setInterval(() => (this.options.time += interval), interval);
	}

	stop() {
		if (this.interval) clearInterval(this.interval);
	}
}

export default class Example extends ExampleView {
	render() {
		this.options.exampleCode = exampleCode;

		super.render();

		new Stopwatch({ appendTo: this.demoWrapper });
	}
}
