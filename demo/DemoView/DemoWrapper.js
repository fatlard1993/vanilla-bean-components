/* eslint-disable spellcheck/spell-checker */
import { DomElem, styled } from '../..';

export const DemoWrapper = styled(
	DomElem,
	({ colors }) => `
		position: relative;
		margin: 3% 6%;
		padding: 5%;
		background: ${colors.darkest(colors.gray)};

		--aug-border-bg: linear-gradient(-12deg, ${colors.light(colors.teal)}, ${colors.light(colors.blue)});
		--aug-border-all: 2px;
		--aug-tl1: 24px;
		--aug-br1: 6px;
	`,
	{
		// eslint-disable-next-line spellcheck/spell-checker
		attributes: { 'data-augmented-ui': 'tl-clip br-clip border' },
	},
);
