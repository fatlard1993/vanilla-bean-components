import DomElem from '../DomElem';

export class Menu extends DomElem {
	constructor({ styles = () => '', appendChildren, appendChild, items = [], onSelect = () => {}, ...options } = {}) {
		super({
			styles: ({ colors, ...theme }) => `
				margin: 0;
				list-style: none;

				li {
					cursor: pointer;
					padding: 6px 6px 9px 6px;

					&:not(:last-of-type) {
						border-bottom: 1px solid ${colors.light(colors.grey)};
					}

					&:hover {
						color: ${colors.light(colors.blue)};
						border-color: ${colors.light(colors.blue)};
					}
				}

				${styles({ colors, ...theme })}
		`,
			tag: 'ul',
			...options,
			appendChildren: [
				...(appendChildren || []),
				...(appendChild ? [appendChild] : []),
				...items.map(
					item =>
						new DomElem({
							tag: 'li',
							onPointerPress: onSelect,
							...item,
						}),
				),
			],
		});
	}
}

export default Menu;
