import { paths } from '../../demo/router/constants';

context('Button', () => {
	before(() => {
		cy.visit(`#${paths.button}`);
	});

	it('Exists', () => {
		cy.get('.button').should('be.visible');
	});
});
