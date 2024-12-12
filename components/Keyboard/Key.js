import { Button } from '../Button';

class Key extends Button {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				styles: (theme, component) => `
					user-select: none;
					display: inline-block;
					border: none;
					padding: 0;
					border-radius: unset;
					margin-bottom: 1px;
					margin-right: 1px;
					height: 32px;
					flex: 1;

					${[1.25, 1.5, 1.75, 2, 2.25, 2.75, 6, 6.25, 7].map(
						unit => `&.u${unit.toString().replace('.', '_')} { flex: ${unit}; }`,
					)}

					${options.styles?.(theme, component) || ''}
				`,
			},
			...children,
		);

		this.addClass(this.options.key);
		this.elem.textContent = this.options.key;

		if (this.options.keyDefinition) {
			const { class: keyClass, text } = this.options.keyDefinition;

			if (keyClass) this.addClass(keyClass);
			if (text !== undefined) this.options.textContent = text;
		}
	}
}

export default Key;
