import { DomElem, Link } from '../components';

import { paths } from './DemoRouter';
import { capitalize } from '../utils/string';

export default class DemoMenu extends DomElem {
	constructor({ styles = () => '', ...options }) {
		super({
			styles: theme => `
				padding: 6px;
				display: flex;
				flex-wrap: wrap;
				gap: 6px;

				.DomElem.Link {
					margin: 0;
					flex: 1 0 auto;
				}

				${styles(theme)}
			`,
			...options,
		});

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
