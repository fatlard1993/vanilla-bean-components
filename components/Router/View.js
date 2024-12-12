import { styled } from '../../utils';
import { Component } from '../Component';

const View = styled(
	Component,
	() => `
		height: 100%;
		display: flex;
		flex-direction: column;
		flex: 1;
	`,
);

export default View;
