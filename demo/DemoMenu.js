import { Component } from '../Component';
import { Button, Link, Menu, Popover } from '../components';
import { Elem } from '../Elem';
import { styled } from '../styled';
import theme from '../theme';
import { capitalize, fromCamelCase, orderBy, toCamelCase } from '../utils';

import views from './views';

const menuItems = {
	documentation: [],
	componentDemos: [],
	examples: [],
};

Object.keys(views).forEach(name => {
	const href = `#${name}`;
	let parent = 'componentDemos';

	if (name.startsWith('/examples/')) parent = 'examples';
	else if (name.startsWith('/documentation/')) parent = 'documentation';

	menuItems[parent].push({
		ListItemComponent: Link,
		listItemOptions: {
			style: {
				border: 'none',
				padding: '0',
				paddingLeft: '18px',
			},
		},
		textContent: /^\/\w+\//.test(name) ? name.replace(/^\/\w+\//, '') : name.slice(1),
		href,
		styles: ({ colors }) => ({
			textDecoration: 'none',
			color: 'inherit',
			padding: '6px 6px 9px 6px',
			borderBottom: '1px solid #999',
			display: 'block',
			...(window.location.hash === href ? { background: colors.black, cursor: 'default' } : {}),
		}),
	});

	menuItems[parent].sort(orderBy({ property: 'textContent', direction: 'asc' }));
});

const StyledComponent = styled(
	Component,
	({ colors }) => `
		display: flex;
		flex-wrap: wrap;
		padding: 12px 24px;
		background-color: ${colors.darkest(colors.gray)};

		li.selected {
			background-color: ${colors.white.setAlpha(0.06)} !important;
		}
	`,
);

export default class DemoMenu extends StyledComponent {
	render() {
		this._links = [];

		this.menuPopover = new Popover({ appendTo: this, style: { top: '32px', left: '32px', maxHeight: '60%' } });

		this.menu = new Menu({
			items: Object.keys(menuItems)
				.map(item => capitalize(fromCamelCase(item, ' '), true))
				.sort(orderBy({ direction: 'asc' })),
			onSelect: ({ target }) => {
				this.openSubMenu(toCamelCase(target.textContent));
			},
			appendTo: this.menuPopover,
		});

		this.subMenu = new Menu({
			appendTo: this.menuPopover,
			style: {
				height: '100%',
				backgroundColor: theme.colors.white.setAlpha(0.06),
			},
		});

		this.menuButton = new Button({
			icon: 'bars',
			tooltip: {
				position: 'bottomRight',
				textContent: 'Menu',
			},
			appendTo: this,
			onPointerPress: () => this.toggle(),
		});

		const title = new Elem({
			tag: 'h1',
			content: window.location.hash.slice(2),
			style: { margin: '0 0 0 12px', fontSize: '24px' },
			appendTo: this,
		});

		document.addEventListener('keyup', ({ key }) => {
			if (key === 'm' || key === 'Escape') this.toggle();
		});

		window.addEventListener('hashchange', () => {
			title.elem.textContent = window.location.hash.slice(2);

			this.menuPopover.hide();
			this.subMenu.options.items = [];
		});

		super.render();
	}

	close() {
		this.menuPopover.hide();
	}

	openMenu() {
		this.menuPopover.show();

		this.openSubMenu(window.location.hash.match(/#\/(.+?)\//)?.[1] || 'componentDemos');
	}

	openSubMenu(menuName) {
		this.subMenu.options.items = menuItems[menuName];

		this.menu.children.forEach(item => {
			item.elem.classList[toCamelCase(item.elem.textContent) === menuName ? 'add' : 'remove']('selected');
		});
	}

	toggle() {
		this[this.menuPopover?.isOpen ? 'close' : 'openMenu']();
	}
}
