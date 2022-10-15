import Router from '.';

context('Router', () => {
	it('must render', () => {
		cy.mount(new Router({ views: {}, paths: {} }).elem);

		cy.get('.router').should('exist');
	});
});
