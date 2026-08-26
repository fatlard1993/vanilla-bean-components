import { Component } from '../../Component';

/**
 * Icon component that renders FontAwesome icons with animation support.
 *
 * Automatically applies FontAwesome classes based on icon name and animation.
 * Handles class management for dynamic icon changes and supports all FontAwesome icon variants.
 * @param {object} [options={}] - Icon configuration options
 * @param {string} [options.icon] - FontAwesome icon name (without 'fa-' prefix)
 * @param {string} [options.animation] - FontAwesome animation name (without 'fa-' prefix), run on the whole element
 * @param {string} [options.iconAnimation] - FontAwesome animation name (without 'fa-' prefix), run on the glyph alone
 * @param {string} [options.content] - Text content to display alongside icon
 * @param {string} [options.textContent] - Alternative text content property
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Icon} Icon component instance
 */
export default class Icon extends Component {
	static schema = {
		icon: {
			set() {
				this._refreshIcon();
			},
		},
		animation: {
			set() {
				this._refreshIcon();
			},
		},
		iconAnimation: {
			set() {
				this._refreshIcon();
			},
		},
		content: {
			set(value, next) {
				next(value);
				this._refreshIcon();
			},
		},
		textContent: {
			set(value, next) {
				next(value);
				this._refreshIcon();
			},
		},
	};

	_refreshIcon() {
		this.removeClass(/\bfa-\S+\b/g);
		this.removeClass(/\bicon-animation-\S+\b/g);

		const { icon, animation, iconAnimation, content, textContent } = this.options;

		if (icon || animation) {
			this.addClass(
				...(content || textContent ? [] : ['icon']),
				...['support', animation, icon].filter(Boolean).map(v => `fa-${v}`),
			);
		}

		// A FontAwesome animation class animates whatever element carries it. On a bare Icon the
		// element and the glyph are the same box, so that reads correctly; on a subclass with a
		// label — Button, Link — it takes the whole control with it. iconAnimation is the same set
		// of animations aimed at the :before that draws the glyph, so the two are separable.
		if (iconAnimation) this.addClass(`icon-animation-${iconAnimation}`);

		const interactive = ['button', 'a', 'input', 'select', 'textarea'].includes(this.elem.tagName.toLowerCase());
		// The options are consulted as well as the element. This runs while options are still being
		// applied, so a caller-supplied `aria-label` is not on the element yet -- reading only the
		// element concluded the icon was unlabelled and hid it, leaving an icon carrying both a label
		// and `aria-hidden="true"`, which is the one combination that helps nobody.
		const labeled =
			this.elem.hasAttribute('aria-label') ||
			this.elem.hasAttribute('aria-labelledby') ||
			this.options['aria-label'] !== undefined ||
			this.options['aria-labelledby'] !== undefined;
		if (!interactive && !content && !textContent && !labeled) {
			this.elem.setAttribute('aria-hidden', 'true');
		} else {
			this.elem.removeAttribute('aria-hidden');
		}
	}
}
