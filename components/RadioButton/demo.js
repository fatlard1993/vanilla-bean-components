import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { RadioButton } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new RadioButton({
			options: ['one', { label: 'two', value: 2 }, 'three'],
			value: 2,
			onChange: console.log,
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
