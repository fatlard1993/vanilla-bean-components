import './index.css';

import { DomElem, Link } from '../components';

import { paths } from './DemoRouter';
import { capitalize } from '../utils/string';

export default class DemoMenu extends DomElem {
	constructor(options) {
		super(options);

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
