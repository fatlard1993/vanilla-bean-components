import { Overlay, Button, DomElem, Label } from '..';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super({
			...options,
			onContextMenu: evt => {
				console.log('contextmenu', evt);

				evt.stop();

				this.openOverlay({ x: evt.clientX, y: evt.clientY });
			},
		});

		this.onPointerUp(this.closeOverlay);

		new Label({
			appendTo: this.demoWrapper,
			textContent: 'Hover Me',
			onHover: evt => this.openOverlay({ x: evt.clientX + 10, y: evt.clientY + 10, closeOnMouseLeave: true }),
			onMouseLeave: () => this.closeOverlay(),
		});

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open Overlay',
			onPointerPress: evt => this.openOverlay({ x: evt.clientX + 10, y: evt.clientY + 10 }),
			onMouseLeave: () => this.closeOverlay(),
		});

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' })],
		});
	}

	openOverlay({ x, y, closeOnMouseLeave }) {
		if (this.overlay) {
			this.overlay.elem.style.top = `${y}px`;
			this.overlay.elem.style.left = `${x}px`;
			return;
		}

		this.closeOverlay();

		this.openingOverlay = true;
		this.overlay = new Overlay({
			appendTo: this.demoContent,
			appendChild: new DomElem({ tag: 'p', textContent: 'Some content for our overlay' }),
			style: { top: `${y}px`, left: `${x}px` },
			onMouseLeave: closeOnMouseLeave ? () => this.closeOverlay() : () => {},
		});

		if (closeOnMouseLeave) this.openingOverlay = false;
		else setTimeout(() => (this.openingOverlay = false), 100);
	}

	closeOverlay() {
		if (this.openingOverlay) {
			this.openingOverlay = false;
			return;
		}

		this.overlay?.remove();
		this.overlay = undefined;
	}
}
