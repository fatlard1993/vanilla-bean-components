import { Code, Label } from '../../components';
import DemoView, { DemoWrapper } from '.';

export default class ExampleView extends DemoView {
	async render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		if (this.options.exampleCode) {
			new Label(
				{ variant: 'collapsible', collapsed: true, label: 'Example Code', appendTo: this },
				new Code({
					style: { margin: '12px auto' },
					code: this.options.exampleCode,
					copyButton: true,
				}),
			);
		}

		super.render();
	}
}
