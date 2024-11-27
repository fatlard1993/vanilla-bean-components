import DemoView, { DemoWrapper } from '../../demo/DemoView';

import thisCode from './demo.js.asText';

import { Code } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Code({
			style: { margin: '0 auto' },
			code: thisCode,
			copyButton: true,
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
