import { Component } from '../../Component';
import { styled } from '../../styled';
import { Button } from '../Button';
import { Input } from '../Input';

import Tag from './Tag';

const StyledComponent = styled(
	Component,
	() => `
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		list-style: none;
		margin: 0;
		padding: 4px;
		box-sizing: border-box;

		&.readOnly {
			pointer-events: none;
			padding: 0;
		}
	`,
);

const TagListInput = styled(
	Input,
	() => `
		flex: 1;
		min-width: 80px;
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

	_addTag(value) {
		value = (value || '').trim();
		if (!value) return;

		const existing = Array.from(this.elem.querySelectorAll('li[data-value]')).map(el => el.dataset.value);
		if (existing.includes(value)) return;

		this.elem.insertBefore(new Tag({ textContent: value }).elem, this.addTag.elem);
		this.tagInput.elem.value = '';
		this.tagInput.elem.focus();
	}

	build() {
		if (!this.options.readOnly) {
			this.tagInput = new TagListInput({ placeholder: 'New Tag' });

			this.tagInput.on({
				targetEvent: 'keyup',
				callback: e => {
					if (e.key === 'Enter') this._addTag(this.tagInput.elem.value);
				},
			});

			this.addTag = new Tag(
				{ readOnly: true, addClass: 'add-tag' },
				this.tagInput,
				new Button({
					icon: 'plus',
					onPointerPress: () => this._addTag(this.tagInput.elem.value),
				}),
			);

			this.replaceCleanup('tagListChildren', () => {
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
	const tagList = new TagList({ tags: ['hello'], autoRender: false });
	tagList.render();
	const before = tagList.elem.children.length;
	tagList.tagInput.elem.value = 'hello';
	tagList.tagInput.elem.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
	return tagList.elem.children.length === before;
};

export const inputIsLastAfterAdd = () => {
	const tagList = new TagList({ tags: [], autoRender: false });
	tagList.render();
	tagList.tagInput.elem.value = 'new-tag';
	tagList.tagInput.elem.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
	return tagList.elem.lastElementChild === tagList.addTag.elem;
};
