import { Code, Label } from '../../components';
import DemoView from '.';

export default class ExampleView extends DemoView {
	async render() {
		this.elem.style.overflow = 'auto';

		super.render();

		if (this.options.exampleCode) {
			new Label(
				{
					variant: 'collapsible',
					collapsed: true,
					label: 'Example Code',
					style: { width: 'calc(98% - 24px)', margin: '1%' },
					appendTo: this,
				},
				new Code({
					style: { margin: '12px auto' },
					code: this.options.exampleCode,
					copyButton: true,
				}),
			);
		}
	}
}
