import DemoView from '../../demo/DemoView';
import { Icon } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Icon({
			icon: 'icons',
			animation: 'spin',
			style: { width: 'fit-content' },
		});
	}
}
