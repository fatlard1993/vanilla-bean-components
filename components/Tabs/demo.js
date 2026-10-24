import DemoView from '../../demo/DemoView';
import { Elem } from '../../Elem';
import { Tabs } from '.';

export default class Demo extends DemoView {
	build() {
		const panels = {
			chat: new Elem({ textContent: 'Two new messages' }),
			comments: new Elem({ textContent: 'No comments yet' }),
			people: new Elem({ textContent: 'Three people here' }),
		};

		this.component = new Tabs({
			tabs: [
				{ id: 'chat', label: 'Chat', count: 2 },
				{ id: 'comments', label: 'Comments' },
				{ id: 'people', label: 'People', count: 3 },
			],
			panels,
			onChange: ({ value }) => value === 'chat' && this.component.count('chat', 0),
		});

		this.demoWrapper.append(...Object.values(panels).map(panel => panel.elem));

		new Tabs({
			appendTo: this.demoWrapper,
			variant: 'segmented',
			tabs: [
				{ id: 'day', label: 'By day', icon: 'calendar-day' },
				{ id: 'project', label: 'By project', icon: 'folder' },
			],
			style: { marginTop: '12px' },
		});
	}
}
