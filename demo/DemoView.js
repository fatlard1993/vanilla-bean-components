import { DomElem, View } from '..';
import DemoMenu from './DemoMenu';

export default class DemoView extends View {
	constructor({ styles = () => '', ...options }) {
		super({
			styles: theme => `
				display: flex;
				flex-direction: column;

				${styles(theme)}
			`,
			...options,
		});

		const appendTo = this;

		this.demoMenu = new DemoMenu({ appendTo });

		this.demoContent = new DomElem({
			styles: () => `
				flex: 1;
				overflow: auto;
			`,
			className: 'demoContent',
			appendTo,
		});

		this.demoWrapper = new DomElem({
			styles: () => `
				position: relative;
				border: 1px solid;
				margin: 5%;
				padding: 5%;
			`,
			className: 'demoWrapper',
			appendTo: this.demoContent,
		});
	}
}
