import { DomElem, Link, Search } from '../components';

import { debounce, styled } from '../utils';

import { views } from './DemoRouter';

const MenuLink = styled(
	Link,
	() => `
		margin: 0;
		flex: 1 0 auto;
		min-width: 78px;
	`,
);

export default class DemoMenu extends DomElem {
	constructor(options = {}) {
		super({
			...options,
			styles: (theme, domElem) => `
				padding: 12px 24px;
				margin-bottom: 6px;
				display: flex;
				flex-wrap: wrap;
				gap: 6px;
				background-color: ${theme.colors.darkest(theme.colors.gray)}

				${options.styles?.(theme, domElem) || ''}
			`,
		});
	}

	render(options = this.options) {
		this._links = [];

		const debouncedFilter = debounce(this.filterLinks.bind(this), 700);

		new Search({
			appendTo: this,
			onKeyUp: ({ value }) => debouncedFilter(value),
			onSearch: ({ value }) => this.filterLinks(value),
		});

		Object.keys(views).forEach(name => {
			const href = `#${name}`;

			this._links.push(
				new MenuLink({
					appendTo: this,
					textContent: name.slice(1),
					href,
					addClass: href === window.location.hash ? 'disabled' : '',
				}),
			);
		});

		super.render(options);
	}

	filterLinks(filter) {
		this._links.forEach(link => {
			link.style.display = link.textContent.toLowerCase().includes(filter.toLowerCase()) ? '' : 'none';
		});
	}

	updateSelection(route) {
		if (!this._links) return;

		this._links.forEach(link => {
			if (link.options.href === `#${route}`) link.addClass('disabled');
			else if (link.hasClass('disabled')) link.removeClass('disabled');
		});
	}
}
