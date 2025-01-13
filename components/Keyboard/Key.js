import { styled } from '../../utils';
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
		super(
			{
				textContent: options.keyDefinition?.text ?? options.key,
				...options,
				addClass: [options.key, options.keyDefinition?.class, ...(options.addClass || [])],
			},
			...children,
		);
	}
}

export default Key;
