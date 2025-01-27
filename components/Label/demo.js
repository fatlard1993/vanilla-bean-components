import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Input } from '../Input';
import { Label } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Label(
			{
				label: 'label',
				tooltip: 'Here is some tooltip text!',
				variant: 'overlay',
				appendTo: this.demoWrapper,
			},
			new Input({ value: '' }),
		);

		super.render();
	}
}
