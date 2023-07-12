import { List } from '../List';

class Menu extends List {
	constructor(options = {}) {
		super({
			...options,
			styles: theme => `
				margin: 0;
				padding: 0;
				list-style: none;

				li {
					cursor: pointer;
					padding: 6px 6px 9px 6px;

					&:not(:last-of-type) {
						border-bottom: 1px solid ${theme.colors.light(theme.colors.gray)};
					}

					&:hover {
						color: ${theme.colors.light(theme.colors.blue)};
						border-color: ${theme.colors.light(theme.colors.blue)};
					}
				}

				${options.styles ? options.styles(theme) : ''}
		`,
			items: (options.items || []).map(item => ({
				onPointerPress: options.onSelect,
				...item,
			})),
		});
	}
}

export default Menu;
