import { styled } from '../../styled';
import { Component, classEnum } from '../../Component';
import { TooltipWrapper } from '../TooltipWrapper';
import { duration, fontSize, radius, space } from '../../theme/tokens';

const StyledLabel = styled(
	TooltipWrapper,
	({ colors, fonts }) => `
		position: relative;
		display: inline-block;
		font-size: ${fontSize.md};
		width: calc(100% - 24px);
		margin: 0 0 ${space.sm};
		padding: ${space.sm} ${space.md};
		background-color: ${colors.raised};
		color: ${colors.white};
		transition: width ${duration.base}, background-color ${duration.base}, border-color ${duration.base};

		/* Its own label, not one inside what it holds (a RadioButton's options are labels too) */
		& > label {
			display: block;
			margin: 0;
			color: ${colors.white};
			padding-left: ${space.xs};
		}

		&.variant-overlay {
			& label {
				position: relative;
				z-index: 1;
				transform: translate(0, 0);
				transition: transform ${duration.base}, color ${duration.base};
			}

			& input {
				transform: translate(0, 0);
				transition: transform ${duration.base};
			}
		}

		&.variant-overlay:not(:focus-within):has(input:placeholder-shown) {
			& label {
				pointer-events: none;
				color: ${colors.muted};
				transform: translate(12px, 20px);
			}

			& input {
				transform: translate(0, -12px);
			}
		}

		&.variant-inline, &.variant-inline-after {
			display: flex;

			& label {
				display: inline-block;
				vertical-align: top;
				margin-top: 5px;
				margin-right: ${space.md};
				line-height: 2;
			}

			& input:not([type=checkbox]), & textarea, & select {
				flex: 1;
			}

			/* A field's error takes its own row, under the text and the control rather than beside them */
			flex-wrap: wrap;

			& > .vbc-field-error {
				flex-basis: 100%;
			}
		}

		/* Drawn after its control even when the control was appended after the text was placed */
		&.variant-inline-after {
			/* Its control is a checkbox or radio, shorter than a text field: the text centres on it */
			align-items: center;

			& > .label-text {
				order: 1;
			}

			& label {
				margin-top: 0;
				margin-left: ${space.md};
				margin-right: 0;
			}
		}

		&.variant-collapsible {
			border: 2px solid ${colors.lighter(colors.teal).setAlpha(0.5)};
			border-radius: ${radius.sm};

			&.collapsed {
				width: 50%;

				& > label {
					color: ${colors.superWhite};

					&:before {
						content: "" !important;
						opacity: 1;
						color: ${colors.lightest(colors.blue)};
					}
				}

				& > *:not(label) {
					display: none !important;
				}
			}

			& > label {
				cursor: pointer;

				&:before {
					${fonts.fontAwesomeSolid}

					content: "";
					opacity: 0.5;
					font-size: ${fontSize.sm};
					padding-right: ${space.sm};
					color: ${colors.white};

					transition: opacity ${duration.slow}, color ${duration.slow};
				}
			}
		}

		& > *:not(label):not(.tooltip) {
			margin-top: ${space.sm};
		}
	`,
);

// The elements a <label for> labels; anything else is named by aria-labelledby
const LABELABLE = new Set(['BUTTON', 'INPUT', 'METER', 'OUTPUT', 'PROGRESS', 'SELECT', 'TEXTAREA']);

// A role that can be named; a plain element (no role, or none or presentation) can't
const hasNameableRole = elem => !['', 'none', 'presentation', 'generic'].includes(elem.getAttribute('role') ?? '');

// Adds or takes one id from an attribute holding a list of them, leaving the others
const setToken = (elem, attribute, id, present) => {
	const ids = new Set((elem.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean));

	ids[present ? 'add' : 'delete'](id);

	if (ids.size) elem.setAttribute(attribute, [...ids].join(' '));
	else elem.removeAttribute(attribute);
};

/**
 * Label component with multiple display variants and input association.
 *
 * Provides flexible label styling with support for overlay, collapsible, inline, and simple variants.
 * Automatically associates with input components and supports interactive collapsible behavior.
 * @param {object|string} [options={}] - Label configuration options, or label text string
 * @param {('overlay'|'collapsible'|'inline'|'inline-after'|'simple')} [options.variant='simple'] - Label display variant
 * @param {string|object} [options.label] - Label text content or label component options
 * @param {Component|string} [options.for] - Input component or ID to associate label with; a component with a
 *   `labelTarget` (a field made of parts) is labelled at that part. Unset, it's the first element child or appended
 * @param {boolean} [options.collapsed] - Whether collapsible variant starts collapsed
 * @param {string} [options.tooltip] - Tooltip text for the label; it also describes the field the label is for
 * @param {...(Component|HTMLElement|string)} children - Child elements, typically input components
 * @returns {Label} Label component instance
 */
class Label extends StyledLabel {
	static schema = {
		variant: classEnum('variant', ['overlay', 'collapsible', 'inline', 'inline-after', 'simple'], {
			default: 'simple',
			set(value) {
				if (this._labelText) {
					const shouldBeAfter = value === 'inline-after';
					const isAfter = this._labelText.elem === this.elem.lastElementChild;
					if (shouldBeAfter !== isAfter) this[shouldBeAfter ? 'append' : 'prepend'](this._labelText);
					// Collapsible, the label is a control: reached by Tab, opened and closed by Enter and Space
					this._labelText.pressable(value === 'collapsible');
					if (value === 'collapsible') {
						this._labelText.elem.setAttribute('aria-expanded', this.hasClass('collapsed') ? 'false' : 'true');
					}
				}
			},
		}),
		label: {
			set(value) {
				if (typeof value === 'object') this._labelText?.setOptions(value);
				else if (this._labelText) this._labelText.options.content = value;
			},
		},
		collapsed: {
			set(value) {
				this[value ? 'addClass' : 'removeClass']('collapsed');
				if (this.options.variant === 'collapsible' && this._labelText) {
					this._labelText.elem.setAttribute('aria-expanded', value ? 'false' : 'true');
				}
			},
		},
		for: {
			set(value) {
				// A field made of parts names the one a label belongs on: a color picker's text box, not its wrapper
				if (typeof value === 'object' && value?.labelTarget) value = value.labelTarget;

				let forId = typeof value === 'string' ? value : value?.id || value?.elem?.id;

				if (!forId) {
					// Two shapes reach here: a component, which carries `elem` and `uniqueId`, and a raw
					// element, which carries a `_component` backreference. The guard tested for the element
					// shape while the body used the component shape, so neither worked -- a component
					// produced an empty `for` and an element threw on `value.elem.id`. A label that looks
					// associated but is not is worse than one that never claimed to be.
					const component = value?.uniqueId ? value : value?._component;
					const elem = value?.elem ?? (value?._component ? value : undefined);

					if (component && elem) forId = elem.id = component.uniqueId;
				}

				if (this._labelText) this._labelText.elem.htmlFor = forId ?? '';

				// Held as given when it is an element, so it is found before it is in the page or in this label
				this._field = forId;
				this._fieldNode = value?.elem ?? (value?.nodeType === 1 ? value : null);
				this._linkField();
				this._nameField();
			},
		},
	};

	/**
	 * The element the label is for: the one given, or else the one with the id given.
	 * @returns {HTMLElement|null} The labelled control, or null when there is none to be found
	 * @private
	 */
	_fieldElem() {
		if (this._fieldNode) return this._fieldNode;
		if (!this._field) return null;

		return (
			this.elem.querySelector(`#${CSS.escape(this._field)}`) ?? this.elem.ownerDocument.getElementById(this._field)
		);
	}

	/**
	 * The tooltip reaches the field as well as the label: the field is what a screen reader is on, and the wrapper's
	 * description is never heard there. Added to the field's own descriptions (an error, a hint), not in their place.
	 * @private
	 */
	_linkField() {
		this._unlinkField();

		const id = this._tooltip?.elem.id;
		const field = id && this._fieldElem();

		if (!field) return;

		setToken(field, 'aria-describedby', id, true);
		this._describedField = { field, id };
	}

	/** @private */
	_unlinkField() {
		if (!this._describedField) return;

		const { field, id } = this._describedField;

		setToken(field, 'aria-describedby', id, false);
		this._describedField = null;
	}

	/**
	 * `for` labels only a control that can be labelled (an input, a select, a button...). Anything else the label is
	 * for that has a role to be named by, a radio group say, is named by the label's text through `aria-labelledby`,
	 * kept beside any name it has. A plain div is left alone: naming one is not allowed.
	 * @private
	 */
	_nameField() {
		if (this._namedField) {
			const { field, id } = this._namedField;

			setToken(field, 'aria-labelledby', id, false);
			this._namedField = null;
		}

		const field = this._fieldElem();

		if (!field || !this._labelText || LABELABLE.has(field.tagName) || !hasNameableRole(field)) return;

		const id = (this._labelText.elem.id ||= `${this.uniqueId}-text`);

		setToken(field, 'aria-labelledby', id, true);
		this._namedField = { field, id };
	}

	_linkTooltip() {
		super._linkTooltip();
		this._linkField();
	}

	_unlinkTooltip() {
		this._unlinkField();
		super._unlinkTooltip();
	}

	static prepareOptions(options, children) {
		// The field the label is for: its first child when that's an element and not text, or else the first element it
		// was given to append, which reads the same at the call site and used to leave the label tied to nothing
		const isField = child => child != null && typeof child !== 'string';
		const field = [children[0]].find(isField) ?? [].concat(options.append ?? []).find(isField);

		return {
			...(field && { for: field }),
			...options,
		};
	}

	constructor(options = {}, ...children) {
		// String shorthand must resolve before Component spreads options
		super(typeof options === 'string' ? { label: options } : options, ...children);
	}

	build() {
		this._labelText = new Component({ tag: 'label', addClass: 'label-text' });

		const handleClick = () => {
			if (this.options.variant !== 'collapsible') return;
			const nowCollapsed = !this.hasClass('collapsed');
			this[nowCollapsed ? 'addClass' : 'removeClass']('collapsed');
			this._labelText.elem.setAttribute('aria-expanded', nowCollapsed ? 'false' : 'true');
		};

		this._labelText.elem.addEventListener('click', handleClick, { signal: this.signal });

		if (this.options.variant === 'collapsible') {
			this._labelText.elem.setAttribute('aria-expanded', this.options.collapsed ? 'false' : 'true');
		}

		this[this.options.variant === 'inline-after' ? 'append' : 'prepend'](this._labelText);
	}
}

export default Label;
