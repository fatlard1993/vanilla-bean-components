import { Elem, Component, Button } from '../..';

import ExampleView from '../DemoView/ExampleView';
import exampleCode from './Stopwatch.js.asText';

export class Stopwatch extends Component {
	static schema = {
		time: {
			default: 0,
			set(value) {
				this._time.content(`${value}ms `);
			},
		},
		// Read by start()
		interval: { default: 10 },
	};

	constructor(options = {}) {
		super({ tag: 'span', ...options });
	}

	build() {
		this._time = new Elem({ tag: 'span' });

		const start = new Button({ content: 'Start', onPointerPress: this.start.bind(this) });
		const stop = new Button({ content: 'Stop', onPointerPress: this.stop.bind(this) });
		const reset = new Button({ content: 'Reset', onPointerPress: this.reset.bind(this) });

		this.content([this._time, start, stop, reset]);
	}

	start() {
		const { interval } = this.options;

		console.log(this._interval);

		if (!this._interval) this._interval = setInterval(() => (this.options.time += interval), interval);
	}

	stop() {
		if (this._interval) {
			clearInterval(this._interval);

			this._interval = undefined;
		}
	}

	reset() {
		this.options.time = 0;
	}
}

export default class Example extends ExampleView {
	build() {
		this.options.exampleCode = exampleCode;

		new Stopwatch({ appendTo: this.demoWrapper });
	}
}
