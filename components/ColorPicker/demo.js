import DemoView from '../../demo/DemoView';
import { Button } from '../Button';
import { ColorPicker } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		const component = new ColorPicker({
			label: 'label',
			value: 'random',
			onChange: console.log,
			appendChildren: [new Button({ textContent: 'Random', onPointerPress: () => component.set('random') })],
		});

		super({ component, ...options });
	}
}
