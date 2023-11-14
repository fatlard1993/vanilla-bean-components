import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '../DomElem';
import { Label } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Label(
			{
				label: 'label',
				tooltip: 'tooltip',
				appendTo: this.demoWrapper,
			},
			new DomElem({ textContent: 'Child Element' }),
		);

		super.render({ ...options, component });
	}
}
