import DemoView from '../../demo/DemoView';
import { Button } from '../Button';
import { Notify } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Notify({
			type: 'info',
			textContent: 'textContent',
			autoOpen: false,
			onPointerPress: () => this.component.hide(),
		});

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Show Notification',
			attributes: { popovertarget: this.component.uniqueId, popovertargetaction: 'show' },
			onPointerPress: event => {
				console.log(event);
				this.component.edgeAwarePlacement({ x: event.clientX + 10, y: event.clientY + 10 });
			},
		});

		new Button({
			appendTo: this.demoWrapper,
			textContent: 'Delete something',
			onPointerPress: () =>
				new Notify({
					type: 'warning',
					timeout: 8000,
					content: 'Deleted 3 bookmarks',
					actions: [
						{
							textContent: 'Undo',
							onPress: () =>
								new Promise(resolve => setTimeout(resolve, 600)).then(() => new Notify({ content: 'Restored' })),
						},
					],
				}),
		});
	}
}
