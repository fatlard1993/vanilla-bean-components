import { Code, Label } from '../../components';
import DemoView from '.';

export default class ExampleView extends DemoView {
	async render() {
		this.elem.style.overflow = 'auto';

		super.render();

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
	}
}
