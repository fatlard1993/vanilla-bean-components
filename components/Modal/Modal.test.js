import { paths } from '../../demo/router/constants';

context('Modal', () => {
	before(() => {
		cy.visit(`#${paths.modal}`);
	});

	it('Exists', () => {
		cy.get('.modal').should('be.visible');
	});
});
