import { paths } from '../../demo/router/constants';

context('IconButton', () => {
	before(() => {
		cy.visit(`#${paths.iconButton}`);
	});

	it('Exists', () => {
		cy.get('.iconButton').should('be.visible');
	});
});
