import DemoView from '../../demo/DemoView';
import { Elem } from '../../Elem';
import { Button } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Button({
			icon: 'icons',
			tooltip: { textContent: 'tooltip', position: 'bottom' },
			onPointerPress: console.log,
			textContent: 'textContent',
		});

		const row = new Elem({
			appendTo: this.demoWrapper,
			style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '12px' },
		});

		for (const variant of [undefined, 'flat', 'chip', 'raised']) {
			new Button({ appendTo: row, textContent: variant ?? 'default', variant });
		}

		new Button({ appendTo: row, textContent: 'selected chip', variant: 'chip', addClass: 'selected' });

		const intents = new Elem({
			appendTo: this.demoWrapper,
			style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '12px' },
		});

		for (const intent of ['info', 'success', 'warning', 'danger']) {
			new Button({ appendTo: intents, textContent: intent, intent });
			new Button({ appendTo: intents, textContent: `flat ${intent}`, intent, variant: 'flat' });
		}
		new Button({ appendTo: row, icon: 'gear', title: 'Icon only' });
	}
}
