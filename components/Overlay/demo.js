import DemoView, { DemoWrapper } from '../../demo/DemoView';
import { DomElem } from '../DomElem';
import { Label } from '../Label';
import { Button } from '../Button';
import { Overlay } from '.';

export default class Demo extends DemoView {
	constructor(options) {
		super({
			...options,
			onContextMenu: event => {
				console.log('onContextMenu', event);

				event.stop();

				if (this.overlay.elem.style.display === 'block') this.closeOverlay();
				else this.openOverlay({ x: event.clientX, y: event.clientY });
			},
		});
	}

	render(options = this.options) {
		this.demoWrapper = new DemoWrapper({ appendTo: this });

		const component = new Overlay({
			styles: () => `
				display: none;
			`,
			append: new DomElem({ tag: 'p', textContent: 'Some content for our overlay' }),
			appendTo: this.demoWrapper,
		});

		this.overlay = component;

		super.render({ ...options, component });

		new Label({
			appendTo: this.demoWrapper,
			label: 'Hover Me',
			onHover: event => this.openOverlay({ x: event.clientX + 10, y: event.clientY + 10 }),
			onMouseLeave: () => this.closeOverlay(),
		});

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open Overlay',
			onPointerPress: event => {
				console.log(event);
				this.openOverlay({ x: event.clientX + 10, y: event.clientY + 10 });
			},
			onMouseLeave: () => this.closeOverlay(),
		});
	}

	openOverlay({ x, y }) {
		console.log('openOverlay', { x, y });
		this.overlay.elem.style.display = 'block';
		this.overlay.elem.style.top = `${y}px`;
		this.overlay.elem.style.left = `${x}px`;
	}

	closeOverlay() {
		console.log('closeOverlay');
		this.overlay.elem.style.display = 'none';
	}
}
