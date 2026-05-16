import DemoView from '../../demo/DemoView';

import thisCode from './demo.js.asText';

import { Code } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Code({
			style: { margin: '0 auto' },
			code: thisCode,
			copyButton: true,
		});
	}
}
