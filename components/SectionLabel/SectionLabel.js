import { styled } from '../../styled';
import { Component } from '../../Component';

/**
 * A small, quiet heading over a group of things: muted, uppercase, spaced. It is a heading to screen readers
 * without taking a heading element's page-wide look.
 * @param {object} [options={}] - SectionLabel configuration
 * @param {string} [options.textContent] - The label
 * @param {number} [options.level=3] - The heading level announced
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {SectionLabel} SectionLabel component instance
 * @example new SectionLabel({ textContent: 'Recent' })
 */
class SectionLabel extends styled(
	Component,
	({ colors }) => `
		margin: 16px 0 6px;
		font-size: 0.75em;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: ${colors.gray};
	`,
) {
	static schema = {
		level: {
			default: 3,
			set(value) {
				this.elem.setAttribute('aria-level', String(value));
			},
		},
	};

	static prepareOptions(options) {
		return { ...options, attributes: { role: 'heading', ...options.attributes } };
	}
}

export default SectionLabel;
