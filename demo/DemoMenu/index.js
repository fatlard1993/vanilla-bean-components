import './index.css';

import { DomElem, Link } from '../../components';

import { paths } from '../Router';
import { capitalize } from '../../utils/string';

export default class DemoMenu extends DomElem {
	constructor({ className, ...rest }) {
		super('div', { className: ['demoMenu', className], ...rest });

		const appendTo = this;

		Object.keys(paths).forEach(name => {
			const href = `#${paths[name]}`;

			new Link({
				appendTo,
				textContent: capitalize(name),
				href,
				className: href === window.location.hash ? 'disabled' : '',
			});
		});
	}
}
