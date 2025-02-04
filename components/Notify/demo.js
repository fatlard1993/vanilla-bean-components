import DemoView from '../../demo/DemoView';
import { Button } from '../Button';
import { Notify } from '.';

export default class Demo extends DemoView {
	render() {
		this.component = new Notify({
			type: 'info',
			textContent: 'textContent',
			autoOpen: false,
			onPointerPress: () => this.component.hide(),
		});

		super.render();

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Show Notification',
			attributes: { popovertarget: this.component.uniqueId, popovertargetaction: 'show' },
			onPointerPress: event => {
				console.log(event);
				this.component.edgeAwarePlacement({ x: event.clientX + 10, y: event.clientY + 10 });
			},
		});
	}
}
