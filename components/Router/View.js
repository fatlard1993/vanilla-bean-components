import { styled } from '../../utils';
import { DomElem } from '../DomElem';

const View = styled(
	DomElem,
	() => `
		height: 100%;
		display: flex;
		flex-direction: column;
		flex: 1;
	`,
);

export default View;
