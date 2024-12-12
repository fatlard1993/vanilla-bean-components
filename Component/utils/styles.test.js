/// <reference lib="dom" />

import { Component } from '..';

import { styled, appendStyles } from './styles';

test('appendStyles', () => {
	const styles = `
		.test {
			margin: 0;
		}
	`;

	appendStyles(styles);

	expect(document.getElementsByTagName('style')[0].innerHTML).toContain(styles);
});

test('styled', () => {
	const styles = () => 'display: flex;';
	const options = { test: 'test' };
	const StyledElem = new (styled(Component, styles, options))();

	expect(StyledElem.options.styles()).toContain(styles());
	expect(StyledElem.options.test).toStrictEqual(options.test);
});
