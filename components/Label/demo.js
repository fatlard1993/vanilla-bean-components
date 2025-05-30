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

		new Label(
			{ appendTo: this.demoWrapper, label: '0' },
			new Label('1', new Label('2', new Label('3', new Label('4', new Label('5', new Label('6')))))),
		);
	}
}
