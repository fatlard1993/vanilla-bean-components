import { Component } from '../Component';
import { TooltipWrapper } from '../TooltipWrapper';

class List extends Component {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				tag: 'ul',
				styles: (theme, component) => `
					margin: 6px 0;
					padding-left: 32px;

					li {
						line-height: 1.3;
						text-indent: 6px;
					}

					&.noStyle {
						padding-left: 0;
						list-style: none;

						li {
							line-height: 1;
							text-indent: 0;
						}
					}

					${options.styles?.(theme, component) || ''}
				`,
			},
			...children,
		);
	}

	setOption(key, value) {
		if (key === 'items') {
			this.content(
				value.map(item => {
					const isContent = typeof item === 'string' || item?.elem || Array.isArray(item);
					const listItem = new TooltipWrapper({ tag: 'li' });

					if (this.options.ListItemComponent) {
						listItem.content(new this.options.ListItemComponent(isContent ? { content: item } : item));
					} else if (isContent) listItem.content(item);
					else listItem.setOptions(item);

					return listItem;
				}),
			);
		} else super.setOption(key, value);
	}
}

export default List;
