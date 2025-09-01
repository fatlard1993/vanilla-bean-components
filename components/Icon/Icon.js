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
	_setOption(key, value) {
		if (key === 'icon' || key === 'animation') {
			this.removeClass(/\bfa-\S+\b/g);

			if (value) {
				this.addClass(
					...(this.options.content || this.options.textContent ? [] : ['icon']),
					...['support', this.options[key === 'icon' ? 'animation' : 'icon'], value]
						.filter(_ => !!_)
						.map(_ => `fa-${_}`),
				);
			}
		} else super._setOption(key, value);
	}
}
