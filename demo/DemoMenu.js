import { Component } from '../Component';
import { Button, Link, Menu, Popover } from '../components';
import { Elem } from '../Elem';
import { styled } from '../styled';
import theme from '../theme';
import { capitalize, fromCamelCase, toCamelCase } from '../utils';

import views from './views';

const StyledComponent = styled(
	Component,
	({ colors }) => `
		display: flex;
		flex-wrap: wrap;
		padding: 12px 24px;
		background-color: ${colors.darkest(colors.gray)};

		&.collapsed {
			height: 36px;
			overflow: hidden;

			h2 {
				opacity: 0;
			}
		}
	`,
);

export default class DemoMenu extends StyledComponent {
	constructor(options = {}) {
		super({
			collapsed: document.body.clientWidth < 780,
			...options,
		});
	}

	render() {
		this._links = [];

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
		});

		this.menuPopover = new Popover({ appendTo: this, style: { maxHeight: '60%' } });

		this.menu = new Menu({
			items: Object.keys(menuItems).map(item => capitalize(fromCamelCase(item, ' '), true)),
			onSelect: ({ target }) => {
				this.subMenu.options.items = menuItems[toCamelCase(target.textContent)];

				this.menu.children.forEach(item => {
					item.elem.style.backgroundColor = 'inherit';
				});

				if (this.subMenu.options.items) target.style.backgroundColor = theme.colors.white.setAlpha(0.06);
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
			popovertarget: this.menuPopover.uniqueId,
			onPointerPress: ({ clientX, clientY }) => {
				this.menuPopover.setStyle({
					top: `${clientY + 6}px`,
					left: `${clientX + 6}px`,
				});
			},
		});

		const title = new Elem({
			tag: 'h1',
			content: window.location.hash.slice(2),
			style: { margin: '0 0 0 12px', fontSize: '24px' },
			appendTo: this,
		});

		window.addEventListener('hashchange', () => {
			title.elem.textContent = window.location.hash.slice(2);

			this.menuPopover.close();
		});

		super.render();
	}
}
