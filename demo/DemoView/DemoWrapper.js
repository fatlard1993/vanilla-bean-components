/* eslint-disable spellcheck/spell-checker */
import { Component, styled } from '../..';

export const DemoWrapper = styled(
	Component,
	({ colors }) => `
		position: relative;
		margin: 3% 6%;
		padding: 5%;
		background: ${colors.darkest(colors.gray)};

		--aug-clip-tl1: initial;
		--aug-clip-br1: initial;
		--aug-border: initial;
		--aug-border-bg: linear-gradient(-12deg, ${colors.light(colors.teal)}, ${colors.light(colors.blue)});
		--aug-border-all: 2px;
		--aug-tl1: 24px;
		--aug-br1: 6px;
	`,
	{ augmentedUI: true },
);
