import DemoView from '../../demo/DemoView';
import { Code } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new Code({
			code: `
				import DemoView from '../../demo/DemoView';
				import Code from '.';

				// Comments too!

				export default class Demo extends DemoView {
					constructor(options) {
						const component = new Code({
							code: '',
							multiline: true,
						});

						super({ component, ...options });
					}
				}
			`,
		});

		super({ component, ...options });
	}
}
