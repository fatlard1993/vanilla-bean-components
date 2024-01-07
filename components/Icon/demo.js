import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Icon } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Icon({
			icon: 'icons',
			animation: 'spin',
			style: { width: 'fit-content' },
			appendTo: this.demoWrapper,
		});

		super.render();
	}
}
