import DemoView from '../../demo/DemoView';
import { Tooltip } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Tooltip({
			textContent: 'My Custom Tooltip',
			icon: 'icons',
			position: 'center',
			appendTo: this.demoWrapper,
			style: { display: 'inline-block', position: 'relative', opacity: 1, animation: 'none' },
		});
	}
}
