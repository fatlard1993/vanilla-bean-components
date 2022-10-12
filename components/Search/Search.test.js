import Search from '.';

context('Search', () => {
	it('must render', () => {
		cy.mount(new Search({}));

		cy.get('.search').should('be.visible');
	});
});
