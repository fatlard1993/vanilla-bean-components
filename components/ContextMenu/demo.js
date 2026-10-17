import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { Notify } from '../Notify';
import { ContextMenu } from '.';

export default class Demo extends DemoView {
	build() {
		const say = textContent => () => new Notify({ type: 'info', textContent });

		this.component = new ContextMenu({
			items: [
				{ textContent: 'Rename', onPointerPress: say('Rename') },
				{ textContent: 'Duplicate', onPointerPress: say('Duplicate') },
				{ textContent: 'Delete', onPointerPress: say('Delete') },
			],
		});

		new Component({
			appendTo: this.demoWrapper,
			textContent: 'Right-click (or long-press) here',
			style: { padding: '24px', border: '1px dashed', userSelect: 'none' },
			onContextmenu: event => {
				event.preventDefault();
				this.component.show({ x: event.clientX, y: event.clientY });
			},
		});
	}
}
