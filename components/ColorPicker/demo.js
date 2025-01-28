import DemoView from '../../demo/DemoView';
import { ColorPicker } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new ColorPicker({
			value: 'random',
			onChange: console.log,
			swatches: ['random', '#FF0000', 'green', 'rgb(0, 0, 255)'],
		});

		super.render();
	}
}
