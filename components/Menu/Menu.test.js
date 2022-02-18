import { paths } from '../../demo/router/constants';

context('Menu', () => {
	before(() => {
		cy.visit(`#${paths.menu}`);
	});

	it('Exists', () => {
		cy.get('.menu').should('exist');
	});
});
