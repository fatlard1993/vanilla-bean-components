import { styled } from '../../styled';
import { List } from '../List';

const StyledList = styled(
	List,
	({ colors }) => `
		margin: 0;
		padding: 0;
		list-style: none;

		li {
			cursor: pointer;
			padding: 6px 6px 9px 6px;

			&:not(:last-of-type) {
				border-bottom: 1px solid ${colors.light(colors.gray)};
			}

			&:hover, &:focus, &:focus-visible, a:hover, a:focus, a:focus-visible  {
				outline: none;
				color: ${colors.light(colors.blue)} !important;
				border-color: ${colors.light(colors.blue)};
			}
		}
	`,
);

class Menu extends StyledList {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				items: (options.items || []).map(item => ({
					onPointerPress: options.onSelect,
					...(typeof item === 'string' ? { textContent: item } : item),
				})),
			},
			...children,
		);
	}
}

export default Menu;
