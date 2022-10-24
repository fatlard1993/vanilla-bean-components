import { Overlay, Button, DomElem, Label } from '..';
import DemoView from '../../demo/DemoView';

export default class Demo extends DemoView {
	constructor(props) {
		super(props);

		const overlay = new Overlay({
			appendTo: this.demoContent,
			appendChild: new DomElem('p', { textContent: 'Some content for our overlay' }),
			style: { position: 'absolute' },
		});

		new Label({
			appendTo: this.demoWrapper,
			textContent: 'Hover Me',
			onHover: evt => {
				overlay.style.top = `${evt.clientY}px`;
				overlay.style.left = `${evt.clientX}px`;
			}
		});

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Open Overlay',
			onPointerPress: evt => {
				overlay.style.top = `${evt.clientY}px`;
				overlay.style.left = `${evt.clientX}px`;
			},
		});
	}
}
