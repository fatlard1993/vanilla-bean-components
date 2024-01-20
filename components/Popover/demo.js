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

				event.preventDefault();
				event.stopPropagation();

				this.component.show({ x: event.clientX, y: event.clientY });
			},
		});
	}

	render() {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		this.component = new Popover({
			autoOpen: false,
			content: 'Some content for our popover',
		});

		super.render();

		new Label({
			appendTo: this.demoWrapper,
			label: 'Hover Me',
			onHover: event => this.component.show({ x: event.clientX + 10, y: event.clientY + 10 }),
			onPointerLeave: () => this.component.hide(),
		});

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open Popover',
			attributes: { popovertarget: this.component.classId },
			onPointerPress: event => {
				console.log(event);
				this.component.edgeAwarePlacement({ x: event.clientX + 10, y: event.clientY + 10 });
			},
			onPointerLeave: () => this.component.hide(),
		});
	}
}
