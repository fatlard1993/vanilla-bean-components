import { DomElem } from '../';

import { styled } from './styled';

test('styled', () => {
	const styles = () => 'display: flex;';
	const StyledElem = new (styled(DomElem, styles))();

	expect(StyledElem instanceof DomElem).toStrictEqual(true);
	expect(StyledElem.options.styles()).toContain(styles());
});
