import DemoView from '../../demo/DemoView';
import { Elem } from '../../Elem';
import { Link } from '.';

export default class Demo extends DemoView {
	build() {
		this.component = new Link({
			textContent: 'textContent',
			href: '#/Dialog',
			variant: 'button',
		});

		const row = new Elem({
			appendTo: this.demoWrapper,
			style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '12px' },
		});

		for (const variant of ['link', 'button', 'flat', 'chip', 'raised']) {
			new Link({ appendTo: row, href: '#/Link', textContent: variant, variant });
		}
	}
}
