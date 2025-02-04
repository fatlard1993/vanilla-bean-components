import DemoView from '../../demo/DemoView';
import { Elem } from '../../Elem';
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
		this.component = new Popover({
			autoOpen: false,
			content: 'Some content for our popover',
		});

		super.render();

		new Label({
			appendTo: this.demoWrapper,
			label: { content: 'Hover this label', style: { pointerEvents: 'none', height: '100px' } },
			onHover: event => this.component.show({ x: event.clientX + 10, y: event.clientY + 10 }),
			onPointerLeave: () => this.component.hide(),
		});

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Click this button',
			popovertarget: this.component.uniqueId,
			onPointerPress: event => {
				console.log(event);
				this.component.edgeAwarePlacement({ x: event.clientX + 10, y: event.clientY + 10 });
			},
			onPointerLeave: () => this.component.hide(),
		});

		new Elem({
			content: 'Right click anywhere below the header',
			style: { marginTop: '6px' },
			appendTo: this.demoWrapper,
		});
	}
}
