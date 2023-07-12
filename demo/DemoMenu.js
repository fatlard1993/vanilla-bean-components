import { DomElem, Link, Search } from '../components';

import { debounceCallback, capitalize, styled } from '../utils';

import { paths } from './DemoRouter';

const MenuLink = styled(
	Link,
	() => `
		margin: 0;
		flex: 1 0 auto;
		min-width: 78px;
	`,
);

export default class DemoMenu extends DomElem {
	constructor(options) {
		super({
			...options,
			styles: theme => `
				padding: 12px 24px;
				margin-bottom: 6px;
				display: flex;
				flex-wrap: wrap;
				gap: 6px;
				background-color: ${theme.colors.darkest(theme.colors.gray)}

				${options.styles ? options.styles(theme) : ''}
			`,
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
			onKeyUp: ({ value }) => debounceCallback(() => this.filterLinks(value)),
			onSearch: ({ value }) => this.filterLinks(value),
		});

		Object.keys(paths).forEach(name => {
			const href = `#${paths[name]}`;

			this.links.push(
				new MenuLink({
					appendTo,
					textContent: capitalize(name),
					href,
					addClass: href === window.location.hash ? 'disabled' : '',
				}),
			);
		});
	}
}
