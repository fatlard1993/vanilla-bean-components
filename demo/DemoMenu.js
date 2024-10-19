import { DomElem, Button, Link, Input } from '../components';

import { debounce, styled } from '../utils';

import views from './views';

const MenuLink = styled(
	Link,
	() => `
		margin: 0;
		flex: 1 0 auto;
		min-width: 78px;
	`,
);

const LinkHeading = styled(
	DomElem,
	() => `
		text-align: center;
		border-bottom: 1px solid;
		padding: 6px 0;
		width: 50%;
		margin: 0 auto;
		flex-basis: 100%;
		font-size: 18px;
	`,
	{ tag: 'h2' },
);

const LinkContainer = styled(
	DomElem,
	() => `
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 6px;
	`,
);

export default class DemoMenu extends DomElem {
	constructor(options = {}) {
		super({
			collapsed: document.body.clientWidth < 780,
			...options,
			styles: (theme, domElem) => `
				display: flex;
				flex-wrap: wrap;
				padding: 12px 24px;
				background-color: ${theme.colors.darkest(theme.colors.gray)};

				&.collapsed {
					height: 36px;
					overflow: hidden;

					h2 {
						opacity: 0;
					}
				}

				${options.styles?.(theme, domElem) || ''}
			`,
		});
	}

	render() {
		this._links = [];

		const debouncedFilter = debounce(this.filterLinks.bind(this), 700);

		this.collapseButton = new Button({
			icon: 'angle-up',
			tooltip: this.options.subscriber('collapsed', collapsed => ({
				position: 'bottomRight',
				textContent: collapsed ? 'Expand' : 'Collapse',
			})),
			appendTo: this,
			onPointerPress: () => {
				this.options.collapsed = !this.options.collapsed;

				this.collapseButton.options.icon = this.options.collapsed ? 'angle-down' : 'angle-up';

				this[this.options.collapsed ? 'addClass' : 'removeClass']('collapsed');
			},
		});

		new Input({
			type: 'search',
			style: { flex: 1 },
			appendTo: this,
			onKeyUp: ({ value }) => debouncedFilter(value),
			onSearch: ({ value }) => this.filterLinks(value),
		});

		new LinkHeading({ appendTo: this }, 'Component Demos');
		const demos = new LinkContainer({ appendTo: this });
		new LinkHeading({ appendTo: this }, 'Examples');
		const examples = new LinkContainer({ appendTo: this });

		Object.keys(views).forEach(name => {
			const href = `#${name}`;

			this._links.push(
				new MenuLink({
					appendTo: name.startsWith('/examples/') ? examples : demos,
					textContent: name.startsWith('/examples/') ? name.replace('/examples/', '') : name.slice(1),
					href,
					addClass: href === window.location.hash ? 'disabled' : '',
					...(document.body.clientWidth < 780 && {
						onPointerPress: () => {
							this.options.collapsed = true;
							window.location.hash = name;
						},
					}),
				}),
			);
		});

		super.render();
	}

	setOption(key, value) {
		if (key === 'collapsed') this[value ? 'addClass' : 'removeClass']('collapsed');
		else super.setOption(key, value);
	}

	filterLinks(filter) {
		this.removeClass('collapsed');
		this.collapseButton.options.icon = 'angle-up';

		this._links.forEach(link => {
			link.elem.style.display = link.elem.textContent.toLowerCase().includes(filter.toLowerCase()) ? '' : 'none';
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
