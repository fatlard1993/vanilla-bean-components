import { Component } from '../../Component';
import { styled } from '../../styled';
import { TooltipWrapper } from '../TooltipWrapper';

const StyledComponent = styled(
	Component,
	() => `
		margin: 6px 0;
		padding-left: 32px;

		&.no-style {
			padding-left: 0;
			list-style: none;

			& li {
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

/**
 * List component for rendering unordered lists with customizable list items.
 *
 * Provides dynamic list rendering with support for custom ListItemComponent classes
 * and flexible item configuration. Automatically wraps items in styled list item elements.
 * @param {object} [options={}] - List configuration options
 * @param {string} [options.tag='ul'] - HTML tag for the list container
 * @param {Array<*>} [options.items] - Array of list items to render
 * @param {Component} [options.ListItemComponent] - Custom component class for rendering items
 * @param {boolean} [options.noStyle] - Whether to apply no-style class for plain list
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {List} List component instance
 */
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

	static handlers = {
		noStyle(value) {
			this.toggleClass('no-style', !!value);
		},
		items(value) {
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
		},
	};
}
