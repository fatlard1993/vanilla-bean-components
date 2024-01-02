import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Button } from '../Button';
import { Notify } from '.';

export default class Demo extends DemoView {
	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Notify({
			type: 'info',
			textContent: 'test',
			autoOpen: false,
			onPointerPress: () => this.component.hide(),
		});

		super.render();

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Show Notification',
			attributes: { popovertarget: this.component.classId, popovertargetaction: 'show' },
			onPointerPress: event => {
				console.log(event);
				this.component.edgeAwarePlacement({ x: event.clientX + 10, y: event.clientY + 10 });
			},
		});
	}
}
