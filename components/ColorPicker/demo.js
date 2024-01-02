import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { ColorPicker } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new ColorPicker({
			value: 'random',
			onChange: console.log,
			appendTo: this.demoWrapper,
			swatches: ['random', '#FF0000', 'green', 'rgb(0, 0, 255)'],
		});

		super.render();
	}
}
