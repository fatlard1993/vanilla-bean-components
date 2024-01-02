/// <reference lib="dom" />

import { DomElem } from '..';

import { styled, appendStyles } from './styled';

test('styled', () => {
	const styles = () => 'display: flex;';
	const options = { test: 'test' };
	const StyledElem = new (styled(DomElem, styles, options))();

	expect(StyledElem.isDomElem).toStrictEqual(true);
	expect(StyledElem.options.styles()).toContain(styles());
	expect(StyledElem.options.test).toStrictEqual(options.test);
});

test('appendStyles', () => {
	const styles = `
		.test {
			margin: 0;
		}
	`;

	appendStyles(styles);

	expect(document.getElementsByTagName('style')[0].innerHTML).toContain(styles);
});
