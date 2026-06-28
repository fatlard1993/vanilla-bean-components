import { Component, styled } from '../..';

export const DemoWrapper = styled(
	Component,
	({ colors }) => `
		position: relative;
		margin: 2% 4%;
		padding: 4%;
		background: ${colors.darkest(colors.gray)};
		border: 2px solid ${colors.light(colors.teal)};
		border-radius: 2px;
		transition: padding 0.2s;

		&.hidden {
			padding: 21px;

			& *:not(button:first-of-type) {
				display: none;
			}
		}
	`,
);
