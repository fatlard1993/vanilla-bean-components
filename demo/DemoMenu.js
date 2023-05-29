import { DomElem, Link } from '../components';

import { styled } from '../utils/styled';

import { paths } from './DemoRouter';
import { capitalize } from '../utils/string';

const MenuLink = styled(
	Link,
	() => `
		margin: 0;
		flex: 1 0 auto;
	`,
);

export default class DemoMenu extends DomElem {
	constructor({ styles = () => '', ...options }) {
		super({
			styles: theme => `
				padding: 6px;
				display: flex;
				flex-wrap: wrap;
				gap: 6px;

				${styles(theme)}
			`,
			...options,
		});

		const appendTo = this;

		Object.keys(paths).forEach(name => {
			const href = `#${paths[name]}`;

			new MenuLink({
				appendTo,
				textContent: capitalize(name),
				href,
				className: href === window.location.hash ? 'disabled' : '',
			});
		});
	}
}
