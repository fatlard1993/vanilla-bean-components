import Page from '.';

context('Page', () => {
	it('must render', () => {
		cy.mount(new Page().elem);

		cy.get('.page').should('exist');
	});
});
