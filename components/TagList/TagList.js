import { Component } from '../../Component';
import { styled } from '../../styled';
import { Button } from '../Button';
import { Input } from '../Input';
import { Popover } from '../Popover';

import Tag from './Tag';

const StyledComponent = styled(
	Component,
	() => `
		margin: 1% auto;
		border-radius: 3px;
		box-sizing: border-box;
		min-height: 1em;
		padding: 0;

		&:after {
			content: '';
			clear: both;
			display: table;
		}

		&.readOnly {
			pointer-events: none;
			border: none;
			background: none;
			width: 100%;
			margin: 0;
		}
	`,
);

const TagListTextInput = styled(
	Input,
	() => `
		display: inline-block;
		flex: 1;
		margin: 3px;
	`,
);

const TagListIconButton = styled(
	Button,
	() => `
		margin: 3px 0 3px 3px;
	`,
);

const defaultOptions = { readOnly: false };

/**
 * Interactive tag list component with add/remove functionality and input support.
 *
 * Displays a collection of tags with optional editing capabilities including
 * inline text input for adding new tags and removal buttons for existing tags.
 * @param {object} [options={}] - TagList configuration options
 * @param {string} [options.tag='ul'] - HTML tag for the container element
 * @param {boolean} [options.readOnly=false] - Whether tags can be added/removed
 * @param {Array<string>} [options.tags] - Initial array of tag text values
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {TagList} TagList component instance
 */
class TagList extends StyledComponent {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super({ ...options, tag: 'ul' }, ...children);
	}

	build() {
		if (!this.options.readOnly) {
			this.tagInput = new TagListTextInput({
				placeholder: 'New Tag',
				onKeyUp: () => {
					this.addButtonPopover[this.tagInput.elem.value.length > 0 ? 'show' : 'hide']();

					this.addTag.elem.style.width = `${Math.max(
						260,
						this.tagInput.elem.value.length *
							Math.round(Number.parseInt(window.getComputedStyle(this.tagInput.elem).fontSize) * 0.75),
					)}px`;
				},
			});

			const { top, left } = this.elem.getBoundingClientRect();
			this.addButtonPopover = new Popover(
				{
					autoOpen: false,
					y: top - 6,
					x: left - 6,
					style: { overflow: 'visible', background: 'none', border: 'none' },
				},
				new Button({
					icon: 'plus',
					onPointerPress: () => {
						const tags = Array.from(this.elem.children).map(elem => elem.textContent);

						if (this.tagInput.elem.value.length === 0 || tags.includes(this.tagInput.elem.value)) return;

						const newTag = new Tag({ textContent: this.tagInput.elem.value });

						this.elem.insertBefore(newTag.elem, this.addTag.elem);

						this.tagInput.elem.value = '';

						this.tagInput.elem.focus();
					},
				}),
			);

			this.addButton = new TagListIconButton({
				icon: 'plus',
				onPointerPress: () => {
					const tags = Array.from(this.elem.children).map(elem => elem.textContent);

					if (this.tagInput.elem.value.length === 0 || tags.includes(this.tagInput.elem.value)) return;

					const newTag = new Tag({ textContent: this.tagInput.elem.value });

					this.elem.insertBefore(newTag.elem, this.addTag.elem);

					this.tagInput.elem.value = '';

					this.tagInput.elem.focus();
				},
			});

			this.addTag = new Tag(
				{
					readOnly: true,
					addClass: 'addTag',
				},
				this.tagInput,
				this.addButtonPopover,
			);
		}

		if (!this.options.readOnly) {
			this.replaceCleanup('tagListChildren', () => {
				this.addButtonPopover?.destroy?.();
				this.addButton?.destroy?.();
				this.tagInput?.destroy?.();
				this.addTag?.destroy?.();
			});
		}

		this.append([
			...(this.options.tags || []).map(textContent => new Tag({ readOnly: this.options.readOnly, textContent })),
			...(this.addTag ? [this.addTag] : []),
		]);
	}
}

export default TagList;

// Zero-arg scenarios for LLD verification
export const duplicateRejected = () => {
	const tl = new TagList({ tags: ['hello'], autoRender: false });
	tl.render();
	const before = tl.elem.children.length;
	tl.tagInput.elem.value = 'hello';
	tl.tagInput.elem.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }));
	return tl.elem.children.length === before;
};

export const inputIsLastAfterAdd = () => {
	const tl = new TagList({ tags: [], autoRender: false });
	tl.render();
	tl.tagInput.elem.value = 'newtag';
	tl.tagInput.elem.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }));
	return tl.elem.lastElementChild === tl.addTag.elem;
};
