import { paths } from '../../demo/router/constants';

context('Search', () => {
	before(() => {
		cy.visit(`#${paths.search}`);
	});

	it('Exists', () => {
		cy.get('.search').should('be.visible');
	});
});
