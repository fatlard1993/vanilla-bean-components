import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Code } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Code({
			code: `
				import DemoView from '../../demo/DemoView';
				import Code from '.';

				// Comments too!

				export default class Demo extends DemoView {
					constructor(options) {
						this.component = new Code({
							code: '',
							multiline: true,
						});

						super({ component, ...options });
					}
				}
			`,
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
