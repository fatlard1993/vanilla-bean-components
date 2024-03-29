import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Select } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Select({
			options: ['one', '2', { label: 'Three', value: 3 }, 'FOUR'],
			value: 3,
			onChange: console.log,
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
