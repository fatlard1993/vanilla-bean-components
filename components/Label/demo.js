import DemoView from '../../demo/DemoView';
import { Input } from '../Input';
import { Label } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new Label(
			{
				label: 'label',
				tooltip: 'Here is some tooltip text!',
				variant: 'overlay',
			},
			new Input({ value: '' }),
		);

		super.render();
	}
}
