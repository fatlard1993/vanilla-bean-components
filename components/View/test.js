import View from '.';

context('View', () => {
	it('must render', () => {
		cy.mount(new View({ views: {}, paths: {} }).elem);

		cy.get('.view').should('exist');
	});
});
