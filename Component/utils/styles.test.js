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
	const css = 'display: flex;';
	const options = { test: 'test' };
	const styledElem = new (styled(Component, () => css, options))();

	expect(styledElem.options.test).toStrictEqual(options.test);

	requestAnimationFrame(() => expect(document.getElementsByTagName('style')[1].innerHTML).toContain(css));
});

test('styled.Component', () => {
	const css = 'display: flex;';
	const options = { test: 'test' };
	const styledElem = new (styled.Component(() => css, options))();

	expect(styledElem.options.test).toStrictEqual(options.test);

	requestAnimationFrame(() => expect(document.getElementsByTagName('style')[2].innerHTML).toContain(css));
});
