import { DomElem } from '..';

import { styled } from './styled';

test('styled', () => {
	const styles = () => 'display: flex;';
	const options = { test: 'test' };
	const StyledElem = new (styled(DomElem, styles, options))();

	expect(StyledElem instanceof DomElem).toStrictEqual(true);
	expect(StyledElem.options.styles()).toContain(styles());
	expect(StyledElem.options.test).toStrictEqual(options.test);
});
