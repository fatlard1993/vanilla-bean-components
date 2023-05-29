import { DomElem, Link, Search } from '../components';

import { debounceCb, capitalize, styled } from '../utils';

import { paths } from './DemoRouter';

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

		this.links = [];

		this.filterLinks = filter => {
			this.links.forEach(link => {
				link.elem.style.display = link.elem.textContent.toLowerCase().includes(filter.toLowerCase()) ? '' : 'none';
			});
		};

		const appendTo = this;

		new Search({
			appendTo,
			onKeyUp: ({ value }) => debounceCb(() => this.filterLinks(value)),
			onSearch: ({ value }) => this.filterLinks(value),
		});

		Object.keys(paths).forEach(name => {
			const href = `#${paths[name]}`;

			this.links.push(
				new MenuLink({
					appendTo,
					textContent: capitalize(name),
					href,
					className: href === window.location.hash ? 'disabled' : '',
				}),
			);
		});
	}
}
