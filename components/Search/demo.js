import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Search } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Search({ appendTo: this.demoWrapper });

		super.render();
	}
}
