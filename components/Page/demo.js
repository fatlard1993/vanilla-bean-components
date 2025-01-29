import DemoView from '../../demo/DemoView';
import { Elem } from '../../Elem';
import { Page } from '.';

const nesCSS = 'https://unpkg.com/nes.css/css/nes.css';

export default class Demo extends DemoView {
	render() {
		this.component = new Page(
			{
				textContent: 'The top-level component; it injects style sheets and renders when the DOM is loaded',
				style: { width: 'auto', height: 'auto' },
				styleSheets: [{ href: nesCSS, scope: '.nes-portal' }],
			},
			new Elem(
				{ addClass: ['nes-portal'] },
				new Elem({ tag: 'i', addClass: ['nes-logo'] }),
				new Elem({ tag: 'i', addClass: ['nes-icon', 'is-large', 'heart'] }),
			),
		);

		super.render();
	}
}
