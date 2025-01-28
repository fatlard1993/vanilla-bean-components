import DemoView from '../../demo/DemoView';
import { Icon } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new Icon({
			icon: 'icons',
			animation: 'spin',
			style: { width: 'fit-content' },
		});

		super.render();
	}
}
