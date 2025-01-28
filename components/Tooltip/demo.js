import DemoView from '../../demo/DemoView';
import { Tooltip } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new Tooltip({
			textContent: 'My Custom Tooltip',
			icon: 'icons',
			position: 'center',
			style: { display: 'inline-block', position: 'relative', opacity: 1, animation: 'none' },
		});

		super.render();
	}
}
