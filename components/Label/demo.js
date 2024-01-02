import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '../DomElem';
import { Label } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Label(
			{
				label: 'label',
				tooltip: 'tooltip',
				appendTo: this.demoWrapper,
			},
			new DomElem({ textContent: 'Child Element' }),
		);

		super.render();
	}
}
