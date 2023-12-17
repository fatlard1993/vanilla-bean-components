import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { Label } from '../Label';
import { Button } from '../Button';
import { Popover } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super({
			...options,
			onContextMenu: event => {
				console.log('onContextMenu', event);

				event.stop();

				this.popover.show({ x: event.clientX, y: event.clientY });
			},
		});
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Popover({
			autoOpen: false,
			content: 'Some content for our popover',
		});

		this.popover = component;

		super.render({ ...options, component });

		new Label({
			appendTo: this.demoWrapper,
			label: 'Hover Me',
			onHover: event => this.popover.show({ x: event.clientX + 10, y: event.clientY + 10 }),
			onMouseLeave: () => this.popover.hide(),
		});

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open Popover',
			attributes: { popovertarget: component.classId },
			onPointerPress: event => {
				console.log(event);
				this.popover.edgeAwarePlacement({ x: event.clientX + 10, y: event.clientY + 10 });
			},
			onMouseLeave: () => this.popover.hide(),
		});
	}
}
