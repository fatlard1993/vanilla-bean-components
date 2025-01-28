import { Component } from '../Component';
import { Button, Menu } from '../components';
import { Elem } from '../Elem';
import { styled } from '../styled';
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
				styles: ({ colors }) => ({
					padding: '0',
					border: 'none',
					...(window.location.hash === href ? { background: colors.black, cursor: 'default' } : {}),
				}),
				append: [
					new Component({
						tag: 'a',
						textContent: /^\/\w+\//.test(name) ? name.replace(/^\/\w+\//, '') : name.slice(1),
						href,
						style: {
							textDecoration: 'none',
							color: 'inherit',
							padding: '6px 6px 9px 6px',
							borderBottom: '1px solid #999',
							display: 'block',
						},
					}),
				],
			});
		});

		this.menu = new Menu({
			items: Object.keys(menuItems).map(item => capitalize(fromCamelCase(item, ' '), true)),
			onSelect: ({ target, clientX, clientY }) => {
				this.subMenu.setStyle({
					display: 'block',
					top: `${clientY + 6}px`,
					left: `${clientX + 6}px`,
				});

				this.subMenu.options.items = menuItems[toCamelCase(target.textContent)];
			},
			style: {
				position: 'absolute',
				zIndex: 1,
				display: 'none',
				backgroundColor: '#333',
				borderRadius: '3px',
				boxShadow: '3px 3px 9px #222',
			},
			appendTo: this,
		});

		this.subMenu = new Menu({
			style: {
				position: 'absolute',
				zIndex: 1,
				display: 'none',
				backgroundColor: '#333',
				borderRadius: '3px',
				boxShadow: '3px 3px 9px #222',
				maxHeight: '50%',
				overflow: 'auto',
			},
			appendTo: this,
		});

		this.menuButton = new Button({
			icon: 'bars',
			tooltip: {
				position: 'bottomRight',
				textContent: 'Menu',
			},
			appendTo: this,
			onPointerPress: ({ clientX, clientY }) => {
				const newMenuDisplay = this.menu.elem.style.display === 'block' ? 'none' : 'block';

				this.menu.setStyle({
					display: newMenuDisplay,
					top: clientY + 6 + 'px',
					left: clientX + 6 + 'px',
				});

				if (newMenuDisplay === 'none') this.subMenu.setStyle({ display: newMenuDisplay });
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

			this.menu.setStyle({ display: 'none' });
			this.subMenu.setStyle({ display: 'none' });
		});

		super.render();
	}
}
