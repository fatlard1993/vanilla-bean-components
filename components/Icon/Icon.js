import { Component } from '../../Component';

/**
 * Icon component that renders FontAwesome icons with animation support.
 *
 * Automatically applies FontAwesome classes based on icon name and animation.
 * Handles class management for dynamic icon changes and supports all FontAwesome icon variants.
 * @param {object} [options={}] - Icon configuration options
 * @param {string} [options.icon] - FontAwesome icon name (without 'fa-' prefix)
 * @param {string} [options.animation] - FontAwesome animation name (without 'fa-' prefix)
 * @param {string} [options.content] - Text content to display alongside icon
 * @param {string} [options.textContent] - Alternative text content property
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Icon} Icon component instance
 */
export default class Icon extends Component {
	static handlers = {
		icon() {
			this._refreshIcon();
		},
		animation() {
			this._refreshIcon();
		},
		content(value, next) {
			next(value);
			this._refreshIcon();
		},
		textContent(value, next) {
			next(value);
			this._refreshIcon();
		},
	};

	_refreshIcon() {
		this.removeClass(/\bfa-\S+\b/g);

		const { icon, animation, content, textContent } = this.options;

		if (icon || animation) {
			this.addClass(
				...(content || textContent ? [] : ['icon']),
				...['support', animation, icon].filter(Boolean).map(v => `fa-${v}`),
			);
		}

		const interactive = ['button', 'a', 'input', 'select', 'textarea'].includes(this.elem.tagName.toLowerCase());
		const labeled = this.elem.hasAttribute('aria-label') || this.elem.hasAttribute('aria-labelledby');
		if (!interactive && !content && !textContent && !labeled) {
			this.elem.setAttribute('aria-hidden', 'true');
		} else {
			this.elem.removeAttribute('aria-hidden');
		}
	}
}
