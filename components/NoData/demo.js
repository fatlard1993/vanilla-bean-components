import { NoData } from '../';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new NoData({ appendTo: this.demoWrapper, textContent: 'There is no data to display' });
	}
}
