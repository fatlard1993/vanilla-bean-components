import { Component } from '../../Component';
import { styled } from '../../styled';
import { TooltipWrapper } from '../TooltipWrapper';

const StyledComponent = styled(
	Component,
	() => `
		margin: 6px 0;
		padding-left: 32px;

		&.noStyle {
			padding-left: 0;
			list-style: none;

			li {
				line-height: 1;
				text-indent: 0;
			}
		}
	`,
);

const ListItem = styled(
	TooltipWrapper,
	() => `
		line-height: 1.3;
		text-indent: 6px;
	`,
);

export default class List extends StyledComponent {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				tag: 'ul',
			},
			...children,
		);
	}

	_setOption(key, value) {
		if (key === 'items') {
			if (!value) {
				this.empty();
				return;
			}

			this.content(
				value.map(item => {
					const isContent = typeof item === 'string' || item?.elem || Array.isArray(item);
					const listItem = new ListItem({ tag: 'li', ...item?.listItemOptions });

					if (this.options.ListItemComponent) {
						listItem.content(new this.options.ListItemComponent(isContent ? { content: item } : item));
					} else if (item.ListItemComponent) {
						listItem.content(new item.ListItemComponent(item));
					} else if (isContent) listItem.content(item);
					else listItem.setOptions(item);

					return listItem;
				}),
			);
		} else super._setOption(key, value);
	}
}
