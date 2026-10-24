import DemoView from '../../demo/DemoView';
import { Component } from '../../Component';
import { Button } from '../Button';
import { Notify } from '../Notify';
import { ContextMenu } from '.';

export default class Demo extends DemoView {
	build() {
		const say = textContent => () => new Notify({ intent: 'info', textContent });

		this.component = new ContextMenu({
			items: [
				{ textContent: 'Rename', onPointerPress: say('Rename') },
				{ textContent: 'Duplicate', onPointerPress: say('Duplicate') },
				{ textContent: 'Delete', onPointerPress: say('Delete') },
			],
		});

		const openAt = event => this.component.open({ x: event.clientX, y: event.clientY });

		new Component({
			appendTo: this.demoWrapper,
			textContent: 'Right-click (or long-press) here',
			style: { padding: '24px', border: '1px dashed', userSelect: 'none' },
			onContextmenu: event => {
				event.preventDefault();
				openAt(event);
			},
			onLongPress: openAt,
		});

		const branches = new ContextMenu({
			items: [
				{ heading: 'Switch to' },
				{ textContent: 'main', detail: 'up to date with origin', onPointerPress: say('main') },
				{ textContent: 'theme-pass', detail: '3 ahead, 1 behind', onPointerPress: say('theme-pass') },
				{ heading: 'Stashes' },
				{ textContent: 'work in progress on main', detail: 'two hours ago', onPointerPress: say('stash') },
			],
		});

		const branchButton = new Button({
			appendTo: this.demoWrapper,
			textContent: 'Branch ▾',
			style: { marginTop: '12px' },
			onPointerPress: () => branches.open({ anchor: branchButton }),
		});
	}
}
