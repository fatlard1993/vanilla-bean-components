import './index.css';

import DomElem from '../DomElem';

export class Menu extends DomElem {
	constructor({ appendChildren, appendChild, items = [], onSelect, ...options } = {}) {
		super({
			tag: 'ul',
			...options,
			appendChildren: [
				...(appendChildren || []),
				...(appendChild ? [appendChild] : []),
				...items.map(
					item =>
						new DomElem({
							tag: 'li',
							onPointerPress: evt => {
								if (onSelect) onSelect(evt);
							},
							...item,
						}),
				),
			],
		});
	}
}

export default Menu;
