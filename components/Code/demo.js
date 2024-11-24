import DemoView, { DemoWrapper } from '../../demo/DemoView';

import { removeExcessIndentation } from '../../DomElem/utils/string';
import { Code } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Code({
			style: { margin: '0 auto' },
			code: removeExcessIndentation(`
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
			`),
			copyButton: true,
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
