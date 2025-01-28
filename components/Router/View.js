import { Component } from '../../Component';
import { styled } from '../../styled';

const View = styled(
	Component,
	() => `
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		flex: 1;
	`,
);

export default View;
