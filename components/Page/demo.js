import { Label } from '..';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		new Label({
			label: 'The entrypoint to a page built with vanilla-bean-components. Mounts its children when the dom is ready',
			appendTo: this.demoContent,
		});
	}
}
