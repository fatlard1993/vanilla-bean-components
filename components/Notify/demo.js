import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Button } from '../Button';
import { Notify } from '.';

export default class Demo extends DemoView {
	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Notify({
			type: 'info',
			textContent: 'test',
			autoOpen: false,
			onPointerPress: () => component.hide(),
		});

		super.render({ ...options, component });

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Show Notification',
			attributes: { popovertarget: component.classId, popovertargetaction: 'show' },
			onPointerPress: event => {
				console.log(event);
				component.edgeAwarePlacement({ x: event.clientX + 10, y: event.clientY + 10 });
			},
		});
	}
}
