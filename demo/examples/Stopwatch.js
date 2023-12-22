import { DomElem, Button } from '../..';

import DemoView, { DemoWrapper } from '../DemoView';

export class Stopwatch extends DomElem {
	constructor(options = {}) {
		super({ tag: 'span', time: 0, interval: 10, running: false, ...options });
	}

	render(options = this.options) {
		this._time = new DomElem({ tag: 'span' });

		const start = new Button({ content: 'Start', onPointerPress: () => this.start() });
		const stop = new Button({ content: 'Stop', onPointerPress: () => this.stop() });
		const reset = new Button({ content: 'Reset', onPointerPress: () => (this.options.time = 0) });

		this.content([this._time, start, stop, reset]);

		super.render(options);
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

export default class Example extends DemoView {
	render(options = this.options) {
		super.render(options);

		new DemoWrapper({ appendTo: this }, new Stopwatch());
	}
}
