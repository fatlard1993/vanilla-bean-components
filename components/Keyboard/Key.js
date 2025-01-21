import { styled } from '../../styled';
import { Button } from '../Button';

const StyledButton = styled(
	Button,
	() => `
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
	`,
);

class Key extends StyledButton {
	constructor(options = {}, ...children) {
		const { key, text, class: keyClass, ...optionsWithoutConfig } = options;

		super(
			{
				textContent: text ?? key,
				...optionsWithoutConfig,
				addClass: [key, keyClass, ...(options.addClass || [])],
			},
			...children,
		);
	}
}

export default Key;
