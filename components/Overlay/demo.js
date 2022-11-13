import { Overlay, Button, DomElem, Label } from '..';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(options) {
		super(options);

		const overlay = new Overlay({
			appendTo: this.demoContent,
			appendChild: new DomElem({ tag: 'p', textContent: 'Some content for our overlay' }),
			style: { display: 'none' },
		});

		new Label({
			appendTo: this.demoWrapper,
			textContent: 'Hover Me',
			onHover: evt => {
				overlay.elem.style.display = 'block';
				overlay.elem.style.top = `${evt.clientY + 10}px`;
				overlay.elem.style.left = `${evt.clientX + 10}px`;
			},
			onMouseLeave: () => {
				overlay.elem.style.display = 'none';
			},
		});

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open Overlay',
			onPointerPress: evt => {
				overlay.elem.style.display = 'block';
				overlay.elem.style.top = `${evt.clientY + 10}px`;
				overlay.elem.style.left = `${evt.clientX + 10}px`;
			},
			onMouseLeave: () => {
				overlay.elem.style.display = 'none';
			},
		});

		new Label({
			label: 'Props',
			appendTo: this.demoContent,
			appendChildren: [new DomElem({ tag: 'pre', textContent: '- ...rest => DomElem' })],
		});
	}
}
