/// <reference lib="dom" />

import { Component } from '../Component';
import { styled } from './styled';

test('styled', () => {
	const css = 'display: flex;';
	const options = { test: 'test' };
	const styledElem = new (styled(Component, () => css, options))();

	expect(styledElem.options.test).toStrictEqual(options.test);

	requestAnimationFrame(() => expect(document.getElementsByTagName('style')[1].innerHTML).toContain(css));
});
